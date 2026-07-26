from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
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


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'currency', 'monthly_income', 
                  'financial_health_score', 'last_score_calculation']
        read_only_fields = ['id', 'financial_health_score', 'last_score_calculation']


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
        data['user'] = UserDetailSerializer(self.user).data
        return data