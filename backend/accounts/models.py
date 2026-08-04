from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.validators import MinValueValidator, MaxValueValidator

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    currency = models.CharField(max_length=3, default='NGN')
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    financial_health_score = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    last_score_calculation = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"{self.user.username}'s profile"

class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    notification_enabled = models.BooleanField(default=True)
    budget_alert_threshold = models.IntegerField(default=80)  # Alert at 80% of budget
    dark_mode = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s preferences"

@receiver(post_save, sender=User)
def create_user_profile_and_preferences(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
        UserPreference.objects.create(user=instance)