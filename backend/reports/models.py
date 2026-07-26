from django.db import models
from django.contrib.auth.models import User

class Report(models.Model):
    REPORT_TYPES = [
        ('expense_summary', 'Expense Summary'),
        ('category_analysis', 'Category Analysis'),
        ('trend_analysis', 'Trend Analysis'),
        ('budget_variance', 'Budget vs Actual'),
        ('group_summary', 'Group Summary'),
        ('monthly_summary', 'Monthly Summary'),
    ]
    
    FORMAT_CHOICES = [
        ('json', 'JSON'),
        ('csv', 'CSV'),
        ('pdf', 'PDF'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    name = models.CharField(max_length=100)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default='json')
    parameters = models.JSONField(default=dict)  # Store report parameters
    file = models.FileField(upload_to='reports/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_generated = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'report_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.name} - {self.report_type} ({self.created_at.date()})"


class ScheduledReport(models.Model):
    """For automated report generation"""
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scheduled_reports')
    name = models.CharField(max_length=100)
    report_type = models.CharField(max_length=20, choices=Report.REPORT_TYPES)
    format = models.CharField(max_length=10, choices=Report.FORMAT_CHOICES, default='json')
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES)
    parameters = models.JSONField(default=dict)
    last_sent = models.DateTimeField(null=True, blank=True)
    next_send = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['next_send']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['next_send']),
        ]