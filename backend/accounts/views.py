from rest_framework import generics, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.models import User
from .models import Profile, UserPreference
from .serializers import (
    UserSerializer, UserRegistrationSerializer,
    ProfileSerializer, UserPreferenceSerializer, UserDetailSerializer,
    MobileTokenObtainPairSerializer,
)
from spendwise.permissions import IsOwner

class UserRegistrationView(generics.CreateAPIView):
    """Allow anyone to register a new user"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Log the user in immediately so the app doesn't need a
            # separate login call right after registering.
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                },
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'message': 'User created successfully'
            }, status=201)
        return Response(serializer.errors, status=400)


class MobileTokenObtainPairView(TokenObtainPairView):
    """Login endpoint. Returns access/refresh tokens plus the user's profile."""
    serializer_class = MobileTokenObtainPairSerializer


class LogoutView(APIView):
    """
    Blacklists the given refresh token so it can't be used again.
    The access token stays valid until it naturally expires (it's never
    checked against the blacklist), so this is really "stop refreshing",
    not an instant kill switch - fine for our short access token lifetime.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'refresh token is required'}, status=400)

        try:
            RefreshToken(refresh_token).blacklist()
        except TokenError:
            return Response({'error': 'Invalid or expired refresh token'}, status=400)

        return Response({'message': 'Successfully logged out'})


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing users (read-only)"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see themselves
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user details"""
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)


class ProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing user profiles"""
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)
    
    def get_object(self):
        # Return the profile for the current user
        return self.request.user.profile
    
    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        """Update current user's profile"""
        profile = request.user.profile
        serializer = self.get_serializer(profile, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class UserPreferenceViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing user preferences"""
    serializer_class = UserPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return UserPreference.objects.filter(user=self.request.user)
    
    def get_object(self):
        # Return the preferences for the current user
        return self.request.user.preferences