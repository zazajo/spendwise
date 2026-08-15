from django.conf import settings
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.models import User
from django.utils.text import slugify
from .models import Profile, UserPreference
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserUpdateSerializer,
    ProfileSerializer, UserPreferenceSerializer, UserDetailSerializer,
    MobileTokenObtainPairSerializer, ChangePasswordSerializer,
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


def _unique_username_from_email(email):
    """Turn 'jane.doe@gmail.com' into a free 'janedoe' username, falling back
    to numbered suffixes on collision - Google gives us an email, not a
    username, but the User model still needs one."""
    base = slugify(email.split('@', 1)[0]).replace('-', '') or 'user'
    username = base
    suffix = 1
    while User.objects.filter(username=username).exists():
        suffix += 1
        username = f'{base}{suffix}'
    return username


class GoogleLoginView(APIView):
    """
    'Sign in with Google' for the mobile app: verifies the id_token Google
    handed the client, then finds or creates a matching User and returns the
    same {access, refresh, user} shape as the regular /token/ login so the
    client can treat both the same way from here on.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if not settings.GOOGLE_OAUTH_CLIENT_ID:
            return Response(
                {'error': 'Google sign-in is not configured on this server'}, status=501
            )

        token = request.data.get('id_token')
        if not token:
            return Response({'error': 'id_token is required'}, status=400)

        try:
            claims = google_id_token.verify_oauth2_token(
                token, google_requests.Request(), settings.GOOGLE_OAUTH_CLIENT_ID
            )
        except ValueError:
            return Response({'error': 'Invalid Google token'}, status=401)

        email = claims.get('email')
        if not email or not claims.get('email_verified'):
            return Response({'error': 'Google account has no verified email'}, status=401)

        user = User.objects.filter(email=email).first()
        if user is None:
            # password=None makes create_user() set an unusable password -
            # this account only ever signs in through Google.
            user = User.objects.create_user(
                username=_unique_username_from_email(email),
                email=email,
                first_name=claims.get('given_name', ''),
                last_name=claims.get('family_name', ''),
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserDetailSerializer(user, context={'request': request}).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


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


class LogoutAllView(APIView):
    """
    Blacklists every outstanding refresh token issued to the current user,
    ending every session (not just the one that called this) - the
    "Log out of all devices" session-management action.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

        outstanding = OutstandingToken.objects.filter(user=request.user)
        count = 0
        for token in outstanding:
            _, created = BlacklistedToken.objects.get_or_create(token=token)
            if created:
                count += 1

        return Response({'message': f'Logged out of all devices ({count} sessions ended)'})


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
        # Context matters: without the request, the nested profile's avatar
        # serializes to a site-relative path the mobile client can't resolve.
        serializer = UserDetailSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['patch'])
    def update_me(self, request):
        """Update the current user's first name, last name, and email."""
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserDetailSerializer(request.user, context={'request': request}).data)
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change the current user's password, given their current one.

        The access token keeps working afterwards - JWTs aren't tied to the
        password hash - so the user isn't kicked out of the app mid-session.
        Other devices also stay signed in; 'Log out of all devices' is the
        existing action for ending those.
        """
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Password changed successfully'})


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

    @action(
        detail=False, methods=['post', 'delete'],
        parser_classes=[MultiPartParser, FormParser],
    )
    def avatar(self, request):
        """Upload (POST) or clear (DELETE) the current user's profile picture."""
        profile = request.user.profile

        if request.method == 'DELETE':
            if profile.avatar:
                # Drop the file itself, not just the reference, so removed
                # avatars don't accumulate in MEDIA_ROOT forever.
                profile.avatar.delete(save=False)
                profile.avatar = None
                profile.save(update_fields=['avatar'])
            return Response(self.get_serializer(profile).data)

        uploaded = request.FILES.get('avatar')
        if not uploaded:
            return Response(
                {'avatar': 'No image was provided'}, status=status.HTTP_400_BAD_REQUEST
            )

        previous = profile.avatar.name if profile.avatar else None
        profile.avatar = uploaded
        profile.save(update_fields=['avatar'])
        if previous:
            profile.avatar.storage.delete(previous)

        return Response(self.get_serializer(profile).data)


class UserPreferenceViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing user preferences"""
    serializer_class = UserPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return UserPreference.objects.filter(user=self.request.user)
    
    def get_object(self):
        # Return the preferences for the current user
        return self.request.user.preferences