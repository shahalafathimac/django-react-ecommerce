from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from core.api import SafeAPIView
from .serializers import (
    AdminUserSerializer,
    ChangePasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    UpdateProfileSerializer,
    UserProfileSerializer,
)

User = get_user_model()


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (getattr(user, 'role', None) == 'admin' or user.is_staff)
        )


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFCookieView(SafeAPIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'message': 'CSRF cookie set.'})


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def set_auth_cookies(response, access_token, refresh_token):
    response.set_cookie(
        settings.AUTH_COOKIE_ACCESS,
        access_token,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
        path=settings.AUTH_COOKIE_PATH,
    )
    response.set_cookie(
        settings.AUTH_COOKIE_REFRESH,
        refresh_token,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
        path=settings.AUTH_COOKIE_PATH,
    )
    return response


def clear_auth_cookies(response):
    response.delete_cookie(
        settings.AUTH_COOKIE_ACCESS,
        path=settings.AUTH_COOKIE_PATH,
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )
    response.delete_cookie(
        settings.AUTH_COOKIE_REFRESH,
        path=settings.AUTH_COOKIE_PATH,
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )
    return response


class RegisterView(SafeAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            response = Response(
                {
                    'message': 'Signup successful.',
                    'user': UserProfileSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )
            return set_auth_cookies(response, tokens['access'], tokens['refresh'])

        if 'email' in serializer.errors:
            return Response({'error': 'User already exists!'}, status=status.HTTP_400_BAD_REQUEST)
        return self.validation_error(serializer)


class LoginView(SafeAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        user = authenticate(request, username=email, password=password)

        if not user:
            return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.active:
            return Response(
                {'error': 'Your account is inactive. Please contact admin.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        tokens = get_tokens_for_user(user)
        response = Response(
            {
                'message': 'Login successful!',
                'user': UserProfileSerializer(user).data,
            }
        )
        return set_auth_cookies(response, tokens['access'], tokens['refresh'])


class TokenRefreshCookieView(SafeAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
        if not refresh_token:
            return Response({'error': 'Refresh token not found.'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            refresh = RefreshToken(refresh_token)
            new_tokens = {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }
        except TokenError:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_401_UNAUTHORIZED)

        response = Response({'message': 'Token refreshed successfully.'})
        return set_auth_cookies(response, new_tokens['access'], new_tokens['refresh'])


class LogoutView(SafeAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
            if not refresh_token:
                response = Response(
                    {'error': 'Refresh token not found.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
                return clear_auth_cookies(response)

            token = RefreshToken(refresh_token)
            token.blacklist()
            response = Response({'message': 'Logged out successfully.'})
            return clear_auth_cookies(response)
        except TokenError:
            response = Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)
            return clear_auth_cookies(response)


class ProfileView(SafeAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)

    def put(self, request):
        serializer = UpdateProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            updated_user = serializer.save()
            return Response(
                {
                    'message': 'Profile updated successfully.',
                    'user': UserProfileSerializer(updated_user).data,
                }
            )
        return self.validation_error(serializer)


class ChangePasswordView(SafeAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'error': 'Old password is incorrect.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully.'})

        return self.validation_error(serializer)


class UserListCreateView(SafeAPIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        users = User.objects.all().order_by('id')
        return Response(AdminUserSerializer(users, many=True).data)

    def post(self, request):
        serializer = AdminUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(AdminUserSerializer(user).data, status=status.HTTP_201_CREATED)
        return self.validation_error(serializer)


class UserDetailView(SafeAPIView):
    permission_classes = [IsAuthenticated]

    def _is_admin(self, request):
        return getattr(request.user, 'role', None) == 'admin' or request.user.is_staff

    def _can_access(self, request, user):
        return self._is_admin(request) or request.user.pk == user.pk

    def get_object(self, pk):
        return get_object_or_404(User, pk=pk)

    def get(self, request, pk):
        user = self.get_object(pk)
        if not self._can_access(request, user):
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        return Response(UserProfileSerializer(user).data)

    def patch(self, request, pk):
        user = self.get_object(pk)
        if not self._can_access(request, user):
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        serializer_class = AdminUserSerializer if self._is_admin(request) else UpdateProfileSerializer
        serializer = serializer_class(user, data=request.data, partial=True)

        if serializer.is_valid():
            updated_user = serializer.save()
            response_serializer = AdminUserSerializer if self._is_admin(request) else UserProfileSerializer
            return Response(response_serializer(updated_user).data)

        return self.validation_error(serializer)

    def delete(self, request, pk):
        if not self._is_admin(request):
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        user = self.get_object(pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
