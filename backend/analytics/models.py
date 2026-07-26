from django.db import models
from django.contrib.auth.models import User
from categories.models import Category
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal

class SpendingPattern(models.Model):
    """Stores spending patterns for anomaly detection"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='spending_patterns')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True)
    period = models.CharField(max_length=20)  # 'daily', 'weekly', 'monthly'
    
    # Statistical data
    average_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    median_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    std_deviation = models.FloatField(default=0)
    
    # Historical data
    frequency = models.IntegerField(default=0)  # Times per period
    trend_direction = models.FloatField(default=0)  # Positive or negative trend
    
    # Seasonal patterns
    seasonal_factors = models.TextField(blank=True, null=True)
    
    calculated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'category', 'period']
        indexes = [
            models.Index(fields=['user', 'calculated_at']),
        ]
    
    def set_seasonal_factors(self, factors_dict):
        import json
        self.seasonal_factors = json.dumps(factors_dict) if factors_dict else None
    
    def get_seasonal_factors(self):
        import json
        if self.seasonal_factors:
            try:
                return json.loads(self.seasonal_factors)
            except:
                return {}
        return {}


class AnomalyRule(models.Model):
    """Rules for detecting anomalies"""
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='anomaly_rules')
    name = models.CharField(max_length=100, default="Default Rule")
    
    # Rule configuration
    threshold_multiplier = models.FloatField(default=2.0)  # Amount > avg * threshold
    lookback_days = models.IntegerField(default=30)  # Days to analyze
    min_amount = models.DecimalField(max_digits=10, decimal_places=2, default=10.00)
    
    # Categories to apply rule (empty means all categories)
    categories = models.ManyToManyField(Category, blank=True)
    
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.user.username}"


class FinancialHealthMetric(models.Model):
    """Financial health score and metrics"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='health_metrics')
    calculated_at = models.DateTimeField(auto_now_add=True)
    
    # Score components (0-100)
    budget_adherence_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)], default=0)
    spending_stability_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)], default=0)
    savings_rate_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)], default=0)
    expense_consistency_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)], default=0)
    overall_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)], default=0)
    
    # Detailed breakdown
    total_monthly_expenses = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    average_daily_spending = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    expense_volatility = models.FloatField(default=0)  # Coefficient of variation
    
    # Recommendations - stored as JSON string
    recommendations = models.TextField(blank=True, default='[]')
    
    class Meta:
        ordering = ['-calculated_at']
        indexes = [
            models.Index(fields=['user', '-calculated_at']),
        ]
    
    def set_recommendations(self, recommendations_list):
        """Store recommendations as JSON string"""
        import json
        if isinstance(recommendations_list, list):
            self.recommendations = json.dumps(recommendations_list)
        elif isinstance(recommendations_list, str):
            self.recommendations = recommendations_list
        else:
            self.recommendations = '[]'
    
    def get_recommendations(self):
        """Retrieve recommendations as list"""
        import json
        if self.recommendations:
            try:
                return json.loads(self.recommendations)
            except json.JSONDecodeError:
                return []
        return []
    
    def __str__(self):
        return f"{self.user.username} - Score: {self.overall_score} ({self.calculated_at.date()})"