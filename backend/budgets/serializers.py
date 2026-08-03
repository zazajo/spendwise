from rest_framework import serializers
from .models import Budget, BudgetAlert
from categories.serializers import CategorySerializer

class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_details = CategorySerializer(source='category', read_only=True)
    percentage_used_display = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = Budget
        fields = [
            'id', 'amount', 'period', 'start_date', 'end_date',
            'spent_amount', 'remaining_amount', 'percentage_used',
            'percentage_used_display', 'status', 'alert_threshold',
            'is_alert_sent', 'is_active', 'created_at', 'updated_at',
            'user', 'category', 'category_name', 'category_details'
        ]
        read_only_fields = ['id', 'spent_amount', 'remaining_amount', 
                           'percentage_used', 'is_alert_sent', 'created_at', 'updated_at']
    
    def get_percentage_used_display(self, obj):
        return f"{obj.percentage_used:.1f}%"
    
    def get_status(self, obj):
        if obj.percentage_used >= 100:
            return 'exceeded'
        elif obj.percentage_used >= obj.alert_threshold:
            return 'warning'
        else:
            return 'good'
    
    def validate(self, data):
        """Validate budget dates"""
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] <= data['start_date']:
                raise serializers.ValidationError({
                    "end_date": "End date must be after start date"
                })
        return data


class BudgetCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ['amount', 'period', 'start_date', 'end_date', 
                  'alert_threshold', 'category']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BudgetAlertSerializer(serializers.ModelSerializer):
    budget_category = serializers.CharField(source='budget.category.name', read_only=True)
    budget_amount = serializers.DecimalField(source='budget.amount', max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = BudgetAlert
        fields = ['id', 'alert_type', 'message', 'sent_at', 'is_read',
                  'budget', 'budget_category', 'budget_amount']
        read_only_fields = ['id', 'sent_at']
