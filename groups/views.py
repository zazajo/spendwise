from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from expense_trackerapi.permissions import IsGroupMember, IsGroupAdmin
from .models import Group, GroupMembership, GroupExpense, GroupExpenseSplit, GroupSettlement
from .serializers import (
    GroupSerializer, GroupMembershipSerializer, GroupInviteSerializer,
    GroupExpenseSerializer, GroupExpenseCreateSerializer,
    GroupBalanceSerializer, GroupSettlementSerializer
)

class GroupViewSet(viewsets.ModelViewSet):
    """ViewSet for managing groups"""
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Show groups where user is a member"""
        return Group.objects.filter(
            members=self.request.user
        ).annotate(
            member_count=Count('members', distinct=True),
            total_expenses=Sum('group_expenses__amount')
        ).prefetch_related('members', 'groupmembership_set__user')

    def get_permissions(self):
        """Add additional permissions for specific actions"""
        if self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsGroupAdmin]
        elif self.action in ['add_member', 'remove_member', 'regenerate_invite']:
            self.permission_classes = [IsAuthenticated, IsGroupAdmin]
        else:
            self.permission_classes = [IsAuthenticated, IsGroupMember]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add a member to the group (admin only)"""
        group = self.get_object()
        username = request.data.get('username')
        role = request.data.get('role', 'member')
        
        if not username:
            return Response(
                {'error': 'Username is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(username=username)
            
            # Check if already a member
            if GroupMembership.objects.filter(group=group, user=user).exists():
                return Response(
                    {'error': 'User is already a member'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            membership = GroupMembership.objects.create(
                group=group,
                user=user,
                role=role
            )
            
            serializer = GroupMembershipSerializer(membership)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def join_by_invite(self, request, pk=None):
        """Join a group using invite code"""
        serializer = GroupInviteSerializer(data=request.data)
        if serializer.is_valid():
            invite_code = serializer.validated_data['invite_code']
            try:
                group = Group.objects.get(invite_code=invite_code, status='active')
                
                # Check if already a member
                if GroupMembership.objects.filter(group=group, user=request.user).exists():
                    return Response(
                        {'error': 'You are already a member of this group'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                membership = GroupMembership.objects.create(
                    group=group,
                    user=request.user,
                    role='member'
                )
                
                return Response({
                    'message': f'Successfully joined {group.name}',
                    'group': GroupSerializer(group, context={'request': request}).data
                })
                
            except Group.DoesNotExist:
                return Response(
                    {'error': 'Invalid invite code'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def regenerate_invite(self, request, pk=None):
        """Regenerate invite code (admin only)"""
        group = self.get_object()
        group.generate_invite_code()
        group.save()
        return Response({'invite_code': group.invite_code})

    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        """Remove a member from the group (admin only)"""
        group = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'User ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if int(user_id) == request.user.id:
            return Response(
                {'error': 'Cannot remove yourself. Use /leave/ endpoint instead.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        deleted = GroupMembership.objects.filter(
            group=group,
            user_id=user_id
        ).delete()
        
        if deleted[0] > 0:
            return Response({'status': 'member removed'})
        return Response(
            {'error': 'Member not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Leave the group"""
        group = self.get_object()
        
        # Check if user is the only admin
        admin_count = GroupMembership.objects.filter(
            group=group,
            role='admin'
        ).count()
        
        membership = GroupMembership.objects.get(
            group=group,
            user=request.user
        )
        
        if membership.role == 'admin' and admin_count == 1:
            return Response(
                {'error': 'You are the only admin. Transfer admin rights before leaving.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        membership.delete()
        return Response({'status': 'left the group'})

    @action(detail=True, methods=['get'])
    def balance(self, request, pk=None):
        """Get balance sheet for the group"""
        group = self.get_object()
        members = group.members.all()
        
        balances = []
        for member in members:
            # Amount paid by member (they created expenses)
            paid = GroupExpense.objects.filter(
                group=group,
                paid_by=member
            ).aggregate(Sum('amount'))['amount__sum'] or 0
            
            # Amount owed by member (their splits that are unpaid)
            owed = GroupExpenseSplit.objects.filter(
                group_expense__group=group,
                user=member,
                is_paid=False
            ).aggregate(Sum('amount'))['amount__sum'] or 0
            
            # Get nickname if available
            membership = GroupMembership.objects.filter(group=group, user=member).first()
            nickname = membership.nickname if membership else ''
            
            net_balance = paid - owed
            
            balances.append({
                'user_id': member.id,
                'username': member.username,
                'nickname': nickname,
                'paid': paid,
                'owes': owed,
                'balance': net_balance
            })
        
        # Calculate suggested settlements
        settlements = self._calculate_settlements(balances)
        
        return Response({
            'balances': balances,
            'suggested_settlements': settlements,
            'total_group_expenses': GroupExpense.objects.filter(group=group).aggregate(
                total=Sum('amount')
            )['total'] or 0
        })

    def _calculate_settlements(self, balances):
        """Calculate who should pay whom"""
        # Separate creditors and debtors
        creditors = [b for b in balances if b['balance'] > 0]
        debtors = [b for b in balances if b['balance'] < 0]
        
        settlements = []
        
        for debtor in sorted(debtors, key=lambda x: x['balance']):
            amount_owed = -debtor['balance']
            
            for creditor in sorted(creditors, key=lambda x: x['balance']):
                if amount_owed <= 0:
                    break
                if creditor['balance'] <= 0:
                    continue
                
                payment = min(amount_owed, creditor['balance'])
                if payment > 0:
                    settlements.append({
                        'from': debtor['username'],
                        'from_id': debtor['user_id'],
                        'to': creditor['username'],
                        'to_id': creditor['user_id'],
                        'amount': payment
                    })
                    amount_owed -= payment
                    creditor['balance'] -= payment
        
        return settlements

    @action(detail=True, methods=['get'])
    def expenses(self, request, pk=None):
        """Get all expenses for the group"""
        group = self.get_object()
        expenses = GroupExpense.objects.filter(group=group)
        
        page = self.paginate_queryset(expenses)
        if page is not None:
            serializer = GroupExpenseSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = GroupExpenseSerializer(expenses, many=True)
        return Response(serializer.data)


class GroupExpenseViewSet(viewsets.ModelViewSet):
    """ViewSet for managing group expenses"""
    permission_classes = [IsAuthenticated, IsGroupMember]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['group', 'paid_by', 'split_type']
    search_fields = ['description']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date']

    def get_queryset(self):
        return GroupExpense.objects.filter(
            group__members=self.request.user
        ).select_related('group', 'paid_by').prefetch_related('splits__user')

    def get_serializer_class(self):
        if self.action == 'create':
            return GroupExpenseCreateSerializer
        return GroupExpenseSerializer

    def perform_create(self, serializer):
        group = serializer.validated_data['group']
        # Check if user is a member of the group
        if not group.members.filter(id=self.request.user.id).exists():
            self.permission_denied(self.request, "You must be a group member to add expenses.")
        serializer.save()

    @action(detail=True, methods=['post'])
    def settle(self, request, pk=None):
        """Mark a split as paid"""
        expense = self.get_object()
        split_id = request.data.get('split_id')
        
        try:
            split = expense.splits.get(id=split_id, user=request.user)
            split.is_paid = True
            split.paid_at = timezone.now()
            split.save()
            return Response({'status': 'split settled'})
        except GroupExpenseSplit.DoesNotExist:
            return Response(
                {'error': 'Split not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get expenses where user hasn't paid their share"""
        pending_splits = GroupExpenseSplit.objects.filter(
            user=request.user,
            is_paid=False
        ).select_related('group_expense', 'group_expense__group', 'group_expense__paid_by')
        
        data = []
        for split in pending_splits:
            data.append({
                'split_id': split.id,
                'expense_id': split.group_expense.id,
                'description': split.group_expense.description,
                'amount': split.amount,
                'group': split.group_expense.group.name,
                'group_id': split.group_expense.group.id,
                'paid_by': split.group_expense.paid_by.username,
                'date': split.group_expense.date
            })
        
        return Response(data)


class GroupSettlementViewSet(viewsets.ModelViewSet):
    """ViewSet for tracking settlements between members"""
    serializer_class = GroupSettlementSerializer
    permission_classes = [IsAuthenticated, IsGroupMember]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['group']
    ordering_fields = ['settled_at']
    ordering = ['-settled_at']

    def get_queryset(self):
        return GroupSettlement.objects.filter(
            group__members=self.request.user
        ).select_related('group', 'from_user', 'to_user')

    def perform_create(self, serializer):
        group = serializer.validated_data['group']
        # Check if both users are members
        if not group.members.filter(id=serializer.validated_data['from_user'].id).exists():
            self.permission_denied(self.request, "From user is not a member of this group")
        if not group.members.filter(id=serializer.validated_data['to_user'].id).exists():
            self.permission_denied(self.request, "To user is not a member of this group")
        serializer.save()

class GroupMembershipViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing group memberships"""
    serializer_class = GroupMembershipSerializer
    permission_classes = [IsAuthenticated, IsGroupMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'role']

    def get_queryset(self):
        return GroupMembership.objects.filter(
            user=self.request.user
        ).select_related('group', 'user')