# recurring/serializers.py
from rest_framework import serializers
from .models import RecurringExpense, RecurringExpenseLog
from expenses.serializers import ExpenseSerializer

class RecurringExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    payment_method_name = serializers.CharField(source='payment_method.name', read_only=True)
    next_occurrence_display = serializers.SerializerMethodField()
    
    class Meta:
        model = RecurringExpense
        fields = [
            'id', 'amount', 'description', 'notes', 'frequency', 'interval',
            'start_date', 'end_date', 'next_occurrence', 'next_occurrence_display',
            'last_occurrence', 'is_active', 'auto_create',
            'user', 'category', 'category_name', 'payment_method', 'payment_method_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'next_occurrence', 'last_occurrence', 
                           'created_at', 'updated_at', 'user']
        extra_kwargs = {
            'user': {'read_only': True},
            'payment_method': {'required': False, 'allow_null': True},
            'amount': {'required': True},
            'description': {'required': True},
            'frequency': {'required': True},
            'start_date': {'required': True},
        }
    
    def get_next_occurrence_display(self, obj):
        if obj.next_occurrence:
            from django.utils import timezone
            days_until = (obj.next_occurrence - timezone.now().date()).days
            if days_until < 0:
                return "Overdue"
            elif days_until == 0:
                return "Today"
            elif days_until == 1:
                return "Tomorrow"
            else:
                return f"In {days_until} days"
        return "Not scheduled"
    
    def create(self, validated_data):
        # Add the user from the request context
        validated_data['user'] = self.context['request'].user
        
        # Set initial next_occurrence to start_date
        if 'start_date' in validated_data:
            validated_data['next_occurrence'] = validated_data['start_date']
        
        return super().create(validated_data)
    
    def validate_category(self, value):
        """Validate that the category belongs to the user"""
        request = self.context.get('request')
        if request and value and value.user != request.user:
            raise serializers.ValidationError("You can only use your own categories")
        return value
    
    def validate_payment_method(self, value):
        """Validate that the payment method belongs to the user"""
        if value:
            request = self.context.get('request')
            if request and value.user != request.user:
                raise serializers.ValidationError("You can only use your own payment methods")
        return value


class RecurringExpenseLogSerializer(serializers.ModelSerializer):
    recurring_expense_details = RecurringExpenseSerializer(
        source='recurring_expense', 
        read_only=True
    )
    expense_details = ExpenseSerializer(source='expense', read_only=True)
    
    class Meta:
        model = RecurringExpenseLog
        fields = [
            'id', 'scheduled_date', 'processed_date', 'status', 'error_message',
            'recurring_expense', 'recurring_expense_details',
            'expense', 'expense_details'
        ]
        read_only_fields = ['id', 'processed_date']


class RecurringExpenseBatchSerializer(serializers.Serializer):
    """Serializer for batch operations on recurring expenses"""
    recurring_expense_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    action = serializers.ChoiceField(choices=['activate', 'deactivate', 'delete'])
    
    def validate_recurring_expense_ids(self, value):
        """Ensure all IDs belong to the current user"""
        request = self.context.get('request')
        if request:
            count = RecurringExpense.objects.filter(
                id__in=value,
                user=request.user
            ).count()
            if count != len(value):
                raise serializers.ValidationError(
                    "Some recurring expenses don't exist or don't belong to you"
                )
        return value