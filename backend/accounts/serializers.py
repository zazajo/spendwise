from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Profile, UserPreference

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8, label="Confirm Password")
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return data
    
    def create(self, validated_data):
        # Remove password2 from the data
        validated_data.pop('password2')
        
        # Create user with encrypted password
        user = User.objects.create_user(**validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Editable subset of User for 'complete profile management' - deliberately
    excludes username (identity/login shouldn't change from a profile form)."""

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'avatar', 'currency', 'monthly_income',
                  'financial_health_score', 'last_score_calculation']
        # The avatar is written through the dedicated multipart `avatar` action,
        # not by the JSON profile form.
        read_only_fields = ['id', 'avatar', 'financial_health_score', 'last_score_calculation']


class ChangePasswordSerializer(serializers.Serializer):
    """Password change for an already-authenticated user.

    The current password is required so that a device someone walked away from
    still logged in can't be used to lock the owner out of their own account.
    """

    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        if not self.context['request'].user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect')
        return value

    def validate_new_password(self, value):
        user = self.context['request'].user
        try:
            # Run Django's configured validators (length, common passwords,
            # similarity to the username/email) rather than inventing our own.
            validate_password(value, user)
        except DjangoValidationError as error:
            raise serializers.ValidationError(list(error.messages))
        return value

    def validate(self, data):
        if data['current_password'] == data['new_password']:
            raise serializers.ValidationError(
                {'new_password': 'New password must be different from the current one'}
            )
        return data

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])
        return user


class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ['id', 'notification_enabled', 'budget_alert_threshold', 'dark_mode']
        read_only_fields = ['id']


class UserDetailSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    preferences = UserPreferenceSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'date_joined', 'profile', 'preferences']


class MobileTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Same as the default JWT login, but bundles the user's profile into the
    response so the app can render the home screen right after login
    without a second round trip to /users/me/.
    """

    def validate(self, attrs):
        data = super().validate(attrs)
        # Forward the context so the nested profile's avatar comes back as an
        # absolute URL the app can load directly.
        data['user'] = UserDetailSerializer(self.user, context=self.context).data
        return data