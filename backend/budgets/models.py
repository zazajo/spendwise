from django.db import models
from django.contrib.auth.models import User
from categories.models import Category
from django.core.validators import MinValueValidator
from decimal import Decimal

class Budget(models.Model):
    PERIOD_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='budgets')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES, default='monthly')
    
    # Budget period
    start_date = models.DateField(db_index=True)
    end_date = models.DateField(null=True, blank=True)
    
    # Budget tracking
    spent_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    remaining_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    percentage_used = models.FloatField(default=0)
    
    # Alert settings
    alert_threshold = models.IntegerField(default=80)  # Alert at 80% usage
    is_alert_sent = models.BooleanField(default=False)
    
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'category', 'period', 'start_date']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['user', 'category', 'start_date']),
        ]

    def __str__(self):
        return f"{self.category.name} budget: {self.amount} ({self.period})"

    def update_spent_amount(self):
        """Calculate spent amount from expenses"""
        from expenses.models import Expense
        from django.db.models import Sum
        from datetime import datetime, timedelta
        
        # Calculate date range based on period
        end_date = self.end_date or datetime.now().date()
        
        spent = Expense.objects.filter(
            user=self.user,
            category=self.category,
            date__gte=self.start_date,
            date__lte=end_date
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        self.spent_amount = spent
        self.remaining_amount = self.amount - spent
        self.percentage_used = float((spent / self.amount) * 100) if self.amount > 0 else 0
        self.save(update_fields=['spent_amount', 'remaining_amount', 'percentage_used'])

class BudgetAlert(models.Model):
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=50, choices=[
        ('threshold', 'Threshold Reached'),
        ('exceeded', 'Budget Exceeded'),
        ('near_limit', 'Near Limit'),
    ])
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['budget', 'is_read']),
        ]