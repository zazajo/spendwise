from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from django.utils import timezone

class Group(models.Model):
    SETTLEMENT_STATUS = [
        ('active', 'Active'),
        ('settled', 'Settled'),
        ('archived', 'Archived'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_groups')
    members = models.ManyToManyField(User, through='GroupMembership', related_name='expense_groups')
    status = models.CharField(max_length=20, choices=SETTLEMENT_STATUS, default='active')
    invite_code = models.CharField(max_length=10, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['invite_code']),
        ]

    def __str__(self):
        return self.name
    
    def generate_invite_code(self):
        import secrets
        import string
        alphabet = string.ascii_uppercase + string.digits
        self.invite_code = ''.join(secrets.choice(alphabet) for _ in range(8))
        return self.invite_code


class GroupMembership(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('member', 'Member'),
        ('viewer', 'Viewer'),
    ]

    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    nickname = models.CharField(max_length=50, blank=True)
    
    # Settlement tracking
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['group', 'user']
        indexes = [
            models.Index(fields=['group', 'user']),
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return f"{self.user.username} in {self.group.name}"


class GroupExpense(models.Model):
    SPLIT_TYPE = [
        ('equal', 'Equal'),
        ('percentage', 'Percentage'),
        ('custom', 'Custom'),
        ('shares', 'Shares'),
    ]

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='group_expenses')
    paid_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='paid_expenses')
    amount = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    description = models.CharField(max_length=255)
    date = models.DateField(db_index=True)
    split_type = models.CharField(max_length=20, choices=SPLIT_TYPE, default='equal')
    
    # If this is linked to a personal expense
    original_expense = models.OneToOneField('expenses.Expense', on_delete=models.SET_NULL, null=True, blank=True)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['group', 'date']),
            models.Index(fields=['paid_by', 'date']),
        ]
        ordering = ['-date']

    def __str__(self):
        return f"{self.description} - {self.amount}"

    def calculate_splits(self):
        """Calculate how much each member owes"""
        members = self.group.members.all()
        member_count = members.count()
        
        if self.split_type == 'equal':
            split_amount = self.amount / member_count
            return {member.id: split_amount for member in members}
        
        elif self.split_type == 'percentage':
            # Would need additional data from a custom model
            pass
        
        elif self.split_type == 'custom':
            # Would use GroupExpenseSplit model
            splits = self.splits.all()
            return {split.user_id: split.amount for split in splits}
        
        return {}


class GroupExpenseSplit(models.Model):
    group_expense = models.ForeignKey(GroupExpense, on_delete=models.CASCADE, related_name='splits')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    percentage = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)], 
        null=True, blank=True
    )
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['group_expense', 'user']
        indexes = [
            models.Index(fields=['user', 'is_paid']),
        ]

    def __str__(self):
        return f"{self.user.username} owes {self.amount} for {self.group_expense.description}"


class GroupSettlement(models.Model):
    """Track settlements between group members"""
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='settlements')
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='settlements_sent')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='settlements_received')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    settled_at = models.DateTimeField(auto_now_add=True)
    notes = models.CharField(max_length=255, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['group', 'settled_at']),
        ]

    def __str__(self):
        return f"{self.from_user.username} paid {self.to_user.username} ${self.amount}"