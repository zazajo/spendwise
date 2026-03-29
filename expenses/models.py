from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from categories.models import Category

class PaymentMethod(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods')
    name = models.CharField(max_length=50)  # Cash, Credit Card, Bank Transfer, etc.
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'name']
        verbose_name_plural = 'payment methods'

    def __str__(self):
        return f"{self.name} - {self.user.username}"


class Expense(models.Model):
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, 
        related_name='expenses', limit_choices_to={'category_type': 'expense'}
    )
    amount = models.DecimalField(
        max_digits=10, decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    description = models.CharField(max_length=255)
    date = models.DateField(db_index=True)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='completed')
    
    # Group expense fields - Using string references to avoid circular import
    group = models.ForeignKey('groups.Group', on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
    is_group_expense = models.BooleanField(default=False)
    
    # Location (optional for insights)
    location = models.CharField(max_length=255, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Notes and attachments
    notes = models.TextField(blank=True)
    receipt_image = models.ImageField(upload_to='receipts/', blank=True, null=True)
    receipt_data = models.TextField(blank=True, null=True)  # Changed from JSONField to TextField for SQLite
    
    # For anomaly detection
    is_anomaly = models.BooleanField(default=False)
    anomaly_score = models.FloatField(null=True, blank=True)
    anomaly_reason = models.CharField(max_length=255, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'category', 'date']),
            models.Index(fields=['user', 'is_anomaly']),
            models.Index(fields=['group', 'date']),
            models.Index(fields=['payment_status']),
        ]

    def __str__(self):
        return f"{self.description}: {self.amount} ({self.date})"

    def save(self, *args, **kwargs):
        # Auto-detect if this is a group expense
        if self.group:
            self.is_group_expense = True
        super().save(*args, **kwargs)
    
    def set_receipt_data(self, data_dict):
        """Helper method to store JSON data as string in SQLite"""
        import json
        self.receipt_data = json.dumps(data_dict) if data_dict else None
    
    def get_receipt_data(self):
        """Helper method to retrieve JSON data from string"""
        import json
        if self.receipt_data:
            try:
                return json.loads(self.receipt_data)
            except json.JSONDecodeError:
                return None
        return None
