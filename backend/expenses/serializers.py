from rest_framework import serializers
from django.contrib.auth.models import User
from .models import PaymentMethod, Expense
from categories.serializers import CategorySerializer

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name', 'is_default']
        read_only_fields = ['id']
    
    def validate(self, data):
        """Ensure only one default payment method per user"""
        request = self.context.get('request')
        if request and data.get('is_default'):
            # Set all other payment methods to non-default
            PaymentMethod.objects.filter(user=request.user, is_default=True).update(is_default=False)
        return data


class ExpenseSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_details = CategorySerializer(source='category', read_only=True)
    payment_method_name = serializers.CharField(source='payment_method.name', read_only=True)
    receipt_data_dict = serializers.SerializerMethodField()
    
    class Meta:
        model = Expense
        fields = [
            'id', 'amount', 'description', 'date', 'payment_status',
            'location', 'notes', 'is_group_expense', 'is_anomaly',
            'anomaly_score', 'anomaly_reason', 'receipt_image',
            'receipt_data', 'receipt_data_dict', 'created_at', 'updated_at',
            'user', 'user_name', 'category', 'category_name', 'category_details',
            'payment_method', 'payment_method_name', 'group'
        ]
        read_only_fields = ['id', 'is_anomaly', 'anomaly_score', 'anomaly_reason',
                           'created_at', 'updated_at', 'user_name', 'category_name',
                           'payment_method_name', 'receipt_data_dict']
        extra_kwargs = {
            'user': {'write_only': True},
            'receipt_data': {'write_only': True},
        }
    
    def get_receipt_data_dict(self, obj):
        """Return receipt data as dictionary if it exists"""
        return obj.get_receipt_data()
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value
    
    def validate_date(self, value):
        """Prevent future dates if needed"""
        from datetime import date
        # this is for future dates
        # if value > date.today():
        #     raise serializers.ValidationError("Future dates are not allowed")
        return value


class ExpenseCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating expenses"""
    class Meta:
        model = Expense
        fields = ['amount', 'description', 'date', 'category', 
                  'payment_method', 'notes', 'location', 'group']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ExpenseSummarySerializer(serializers.Serializer):
    """Serializer for expense summaries/analytics"""
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    expense_count = serializers.IntegerField()
    average_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    category_name = serializers.CharField()
    month = serializers.CharField(required=False)
    year = serializers.IntegerField(required=False)