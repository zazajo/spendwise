from rest_framework import serializers
from .models import Group, GroupMembership, GroupExpense, GroupExpenseSplit, GroupSettlement
from accounts.serializers import UserSerializer
from django.db.models import Sum

class GroupMembershipSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = GroupMembership
        fields = ['id', 'user', 'user_details', 'username', 'role', 'nickname', 'balance', 'joined_at']
        read_only_fields = ['id', 'balance', 'joined_at']


class GroupSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(read_only=True, default=0)
    total_expenses = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, default=0)
    members = GroupMembershipSerializer(source='groupmembership_set', many=True, read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    is_admin = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = [
            'id', 'name', 'description', 'status', 'invite_code', 'member_count',
            'total_expenses', 'members', 'created_by', 'created_by_username',
            'is_admin', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'invite_code']
    
    def get_is_admin(self, obj):
        request = self.context.get('request')
        if not (request and request.user and request.user.is_authenticated):
            return False
        # groupmembership_set is already prefetched by GroupViewSet.get_queryset,
        # so scan it in Python - querying here costs one extra round trip per
        # group in the list response.
        return any(
            membership.user_id == request.user.id and membership.role == 'admin'
            for membership in obj.groupmembership_set.all()
        )
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        group = super().create(validated_data)
        group.generate_invite_code()
        group.save()
        
        # Add creator as admin member
        GroupMembership.objects.create(
            group=group,
            user=self.context['request'].user,
            role='admin'
        )
        return group


class GroupInviteSerializer(serializers.Serializer):
    """Serializer for joining a group via invite code"""
    invite_code = serializers.CharField(max_length=10, write_only=True)
    
    def validate_invite_code(self, value):
        try:
            group = Group.objects.get(invite_code=value, status='active')
        except Group.DoesNotExist:
            raise serializers.ValidationError("Invalid invite code")
        return value


class GroupExpenseSplitSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = GroupExpenseSplit
        fields = ['id', 'user', 'user_name', 'amount', 'percentage', 'is_paid', 'paid_at']
        read_only_fields = ['id', 'paid_at']


class GroupExpenseSerializer(serializers.ModelSerializer):
    paid_by_name = serializers.CharField(source='paid_by.username', read_only=True)
    splits = GroupExpenseSplitSerializer(many=True, read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    total_splits_amount = serializers.SerializerMethodField()
    is_settled = serializers.SerializerMethodField()
    
    class Meta:
        model = GroupExpense
        fields = [
            'id', 'amount', 'description', 'date', 'split_type',
            'paid_by', 'paid_by_name', 'group', 'group_name',
            'splits', 'total_splits_amount', 'is_settled',
            'notes', 'original_expense', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_splits_amount(self, obj):
        """Check if splits sum matches total amount"""
        total = obj.splits.aggregate(total=Sum('amount'))['total'] or 0
        return total
    
    def get_is_settled(self, obj):
        """Check if all splits are paid"""
        return not obj.splits.filter(is_paid=False).exists()


class GroupExpenseCreateSerializer(serializers.ModelSerializer):
    splits = GroupExpenseSplitSerializer(many=True, required=False)
    
    class Meta:
        model = GroupExpense
        fields = ['amount', 'description', 'date', 'split_type', 
                  'paid_by', 'group', 'splits', 'notes']
    
    def validate(self, data):
        """Validate that splits sum to total amount"""
        split_type = data.get('split_type', getattr(self.instance, 'split_type', None))
        amount = data.get('amount', getattr(self.instance, 'amount', None))
        splits = data.get('splits', [])
        group = data.get('group', getattr(self.instance, 'group', None))
        paid_by = data.get('paid_by', getattr(self.instance, 'paid_by', None))

        # Verify the paid_by user is a member of the group
        if group is not None and paid_by is not None and not group.members.filter(id=paid_by.id).exists():
            raise serializers.ValidationError(
                {"paid_by": "User is not a member of this group"}
            )

        # Only validate the split configuration when the client is actually
        # sending one (always true on create; on update, only when the request
        # resends split_type - see the matching `recompute_splits` check in update()).
        if 'split_type' in data:
            if split_type == 'equal':
                # Will be handled in create/update - no validation needed here
                pass
            elif split_type in ('custom', 'percentage', 'shares'):
                if not splits:
                    raise serializers.ValidationError(
                        {"splits": f"{split_type.capitalize()} splits require split details"}
                    )
                total_split = sum(split['amount'] for split in splits)
                if amount is not None and abs(total_split - amount) > 0.01:  # Allow small rounding
                    raise serializers.ValidationError(
                        f"Splits sum ({total_split}) does not equal expense amount ({amount})"
                    )

        return data

    def _create_splits(self, group_expense, split_type, amount, group, splits_data):
        if split_type == 'equal':
            # Calculate equal splits for ALL group members
            members = group.members.all()
            member_count = members.count()

            if member_count == 0:
                raise serializers.ValidationError("Group has no members")

            # Calculate equal split amount
            split_amount = amount / member_count

            # Create a split for each group member
            for member in members:
                GroupExpenseSplit.objects.create(
                    group_expense=group_expense,
                    user=member,
                    amount=split_amount
                )
        else:
            # Use provided splits
            for split_data in splits_data:
                GroupExpenseSplit.objects.create(
                    group_expense=group_expense,
                    **split_data
                )

    def create(self, validated_data):
        splits_data = validated_data.pop('splits', [])
        group = validated_data['group']
        amount = validated_data['amount']

        # Create the group expense
        group_expense = GroupExpense.objects.create(**validated_data)
        self._create_splits(group_expense, validated_data.get('split_type'), amount, group, splits_data)

        return group_expense

    def update(self, instance, validated_data):
        splits_data = validated_data.pop('splits', None)
        # Only recompute splits when the client explicitly sent a split configuration
        # (the mobile edit form always resubmits split_type + splits together).
        recompute_splits = 'split_type' in validated_data

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if recompute_splits:
            instance.splits.all().delete()
            self._create_splits(
                instance, instance.split_type, instance.amount, instance.group, splits_data or []
            )

        return instance


class GroupSettlementSerializer(serializers.ModelSerializer):
    from_user_name = serializers.CharField(source='from_user.username', read_only=True)
    to_user_name = serializers.CharField(source='to_user.username', read_only=True)
    
    class Meta:
        model = GroupSettlement
        fields = ['id', 'group', 'from_user', 'from_user_name', 'to_user', 'to_user_name',
                  'amount', 'settled_at', 'notes']
        read_only_fields = ['id', 'settled_at']