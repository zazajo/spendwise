from django.db import models
from django.contrib.auth.models import User
from categories.models import Category
from django.core.validators import MinValueValidator
from decimal import Decimal
from datetime import timedelta, date
from dateutil.relativedelta import relativedelta

class RecurringExpense(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('biweekly', 'Bi-Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
        ('custom', 'Custom'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recurring_expenses')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='recurring_expenses')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    payment_method = models.ForeignKey('expenses.PaymentMethod', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Recurrence rules
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    interval = models.IntegerField(default=1)  # For custom intervals: e.g., every 2 weeks
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    next_occurrence = models.DateField(db_index=True)
    last_occurrence = models.DateField(null=True, blank=True)
    
    # Recurrence pattern (for complex rules)
    recurrence_pattern = models.TextField(blank=True, null=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    auto_create = models.BooleanField(default=False)  # Changed to False by default - manual generation
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'next_occurrence']),
            models.Index(fields=['user', 'is_active']),
        ]

    def __str__(self):
        return f"{self.description} - {self.frequency}"
    
    def calculate_next_date(self, from_date=None):
        """
        Calculate the next occurrence date based on frequency
        """
        if from_date is None:
            from_date = self.next_occurrence or self.start_date
        
        if self.frequency == 'daily':
            return from_date + timedelta(days=self.interval)
        elif self.frequency == 'weekly':
            return from_date + timedelta(weeks=self.interval)
        elif self.frequency == 'biweekly':
            return from_date + timedelta(weeks=2 * self.interval)
        elif self.frequency == 'monthly':
            return from_date + relativedelta(months=self.interval)
        elif self.frequency == 'quarterly':
            return from_date + relativedelta(months=3 * self.interval)
        elif self.frequency == 'yearly':
            return from_date + relativedelta(years=self.interval)
        else:
            # For custom frequency, you'd need to parse recurrence_pattern
            # For now, default to monthly
            return from_date + relativedelta(months=1)
    
    def generate_expense(self, expense_date=None):
        """
        Generate an actual expense from this recurring template
        """
        from expenses.models import Expense
        
        if expense_date is None:
            expense_date = self.next_occurrence
        
        # Create the expense
        expense = Expense.objects.create(
            user=self.user,
            category=self.category,
            amount=self.amount,
            description=self.description,
            date=expense_date,
            payment_method=self.payment_method,
            notes=f"Auto-generated from recurring expense: {self.description}"
        )
        
        # Update last occurrence
        self.last_occurrence = expense_date
        
        # Calculate next occurrence
        self.next_occurrence = self.calculate_next_date(expense_date)
        
        # Check if we've reached the end date
        if self.end_date and self.next_occurrence > self.end_date:
            self.is_active = False
        
        self.save()
        
        # Create a log entry
        RecurringExpenseLog.objects.create(
            recurring_expense=self,
            expense=expense,
            scheduled_date=expense_date,
            status='created'
        )
        
        return expense
    
    def get_upcoming_dates(self, count=5):
        """
        Get the next X upcoming dates without generating expenses
        """
        dates = []
        current = self.next_occurrence
        
        for i in range(count):
            if self.end_date and current > self.end_date:
                break
            dates.append(current)
            current = self.calculate_next_date(current)
        
        return dates
    
    def set_recurrence_pattern(self, pattern_dict):
        """Helper method to store JSON data as string in SQLite"""
        import json
        self.recurrence_pattern = json.dumps(pattern_dict) if pattern_dict else None
    
    def get_recurrence_pattern(self):
        """Helper method to retrieve JSON data from string"""
        import json
        if self.recurrence_pattern:
            try:
                return json.loads(self.recurrence_pattern)
            except json.JSONDecodeError:
                return None
        return None


class RecurringExpenseLog(models.Model):
    """Track when recurring expenses are processed"""
    STATUS_CHOICES = [
        ('created', 'Created'),
        ('skipped', 'Skipped'),
        ('failed', 'Failed'),
    ]
    
    recurring_expense = models.ForeignKey(RecurringExpense, on_delete=models.CASCADE, related_name='logs')
    expense = models.ForeignKey('expenses.Expense', on_delete=models.SET_NULL, null=True, blank=True)
    scheduled_date = models.DateField()
    processed_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='created')
    error_message = models.TextField(blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['scheduled_date', 'status']),
        ]

    def __str__(self):
        return f"{self.recurring_expense.description} - {self.scheduled_date}"