from rest_framework import serializers
from .models import SpendingPattern, AnomalyRule, FinancialHealthMetric
from categories.serializers import CategorySerializer


class SpendingPatternSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    seasonal_factors_dict = serializers.SerializerMethodField()
    
    class Meta:
        model = SpendingPattern
        fields = [
            'id', 'period', 'average_amount', 'median_amount',
            'std_deviation', 'frequency', 'trend_direction',
            'seasonal_factors', 'seasonal_factors_dict', 'calculated_at',
            'user', 'category', 'category_name'
        ]
        read_only_fields = ['id', 'calculated_at', 'user']
    
    def get_seasonal_factors_dict(self, obj):
        return obj.get_seasonal_factors()


class AnomalyRuleSerializer(serializers.ModelSerializer):
    category_names = serializers.SerializerMethodField()
    
    class Meta:
        model = AnomalyRule
        fields = [
            'id', 'name', 'threshold_multiplier', 'lookback_days',
            'min_amount', 'severity', 'is_active', 'created_at',
            'categories', 'category_names', 'user'
        ]
        read_only_fields = ['id', 'created_at', 'user']
    
    def get_category_names(self, obj):
        return [cat.name for cat in obj.categories.all()]
    
    def create(self, validated_data):
        categories = validated_data.pop('categories', [])
        validated_data['user'] = self.context['request'].user
        rule = AnomalyRule.objects.create(**validated_data)
        rule.categories.set(categories)
        return rule
    
    def update(self, instance, validated_data):
        categories = validated_data.pop('categories', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if categories is not None:
            instance.categories.set(categories)
        instance.save()
        return instance


class FinancialHealthMetricSerializer(serializers.ModelSerializer):
    recommendations_list = serializers.SerializerMethodField()
    health_grade = serializers.SerializerMethodField()
    health_status = serializers.SerializerMethodField()
    
    class Meta:
        model = FinancialHealthMetric
        fields = [
            'id', 'calculated_at', 'budget_adherence_score',
            'spending_stability_score', 'savings_rate_score',
            'expense_consistency_score', 'overall_score',
            'total_monthly_expenses', 'average_daily_spending',
            'expense_volatility', 'recommendations', 'recommendations_list',
            'health_grade', 'health_status', 'user'
        ]
        read_only_fields = ['id', 'calculated_at', 'user']
    
    def get_recommendations_list(self, obj):
        """Get recommendations as a list"""
        return obj.get_recommendations()
    
    def get_health_grade(self, obj):
        score = obj.overall_score
        if score >= 90:
            return 'A'
        elif score >= 80:
            return 'B'
        elif score >= 70:
            return 'C'
        elif score >= 60:
            return 'D'
        else:
            return 'F'
    
    def get_health_status(self, obj):
        score = obj.overall_score
        if score >= 80:
            return 'Excellent'
        elif score >= 70:
            return 'Good'
        elif score >= 60:
            return 'Fair'
        elif score >= 50:
            return 'Needs Improvement'
        else:
            return 'Poor'
    
    def validate_recommendations(self, value):
        """Validate that recommendations is a list"""
        if isinstance(value, list):
            return value
        elif isinstance(value, str):
            # If it's a string, try to parse it as JSON
            import json
            try:
                return json.loads(value)
            except:
                return []
        return []
    
    def to_internal_value(self, data):
        """Override to handle recommendations properly"""
        if 'recommendations' in data and isinstance(data['recommendations'], list):
            # Convert list to JSON string for storage
            import json
            data = data.copy()
            data['recommendations'] = json.dumps(data['recommendations'])
        return super().to_internal_value(data)
    
    def create(self, validated_data):
        """Create with proper recommendations handling"""
        recommendations = validated_data.pop('recommendations', None)
        instance = FinancialHealthMetric.objects.create(**validated_data)
        if recommendations:
            if isinstance(recommendations, str):
                instance.recommendations = recommendations
            else:
                instance.set_recommendations(recommendations)
            instance.save()
        return instance
    
    def update(self, instance, validated_data):
        """Update with proper recommendations handling"""
        recommendations = validated_data.pop('recommendations', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if recommendations:
            if isinstance(recommendations, str):
                instance.recommendations = recommendations
            else:
                instance.set_recommendations(recommendations)
        instance.save()
        return instance