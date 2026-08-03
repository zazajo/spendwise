from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    expense_count = serializers.IntegerField(read_only=True, default=0)
    total_spent = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, default=0)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'category_type', 'description', 'color', 
                  'icon', 'is_default', 'is_active', 'expense_count', 'total_spent',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'is_default', 'created_at', 'updated_at']
    
    def validate_name(self, value):
        """Ensure category name is unique per user"""
        request = self.context.get('request')
        if request and request.user:
            # Check if category exists for this user (excluding current instance)
            queryset = Category.objects.filter(user=request.user, name__iexact=value)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError("You already have a category with this name")
        return value
