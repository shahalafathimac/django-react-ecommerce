from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
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
    ForgotPasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
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
            return Response(
                {
                    'message': 'Signup successful.',
                    'user': UserProfileSerializer(user).data,
                    **tokens,
                },
                status=status.HTTP_201_CREATED,
            )

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
        return Response(
            {
                'message': 'Login successful!',
                'user': UserProfileSerializer(user).data,
                **tokens,
            }
        )


class TokenRefreshCookieView(SafeAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refresh") or request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
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

        return Response({'message': 'Token refreshed successfully.', **new_tokens})


class LogoutView(SafeAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh") or request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token not found.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except TokenError:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


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


class ForgotPasswordView(SafeAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer)

        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email, active=True).first()
        response_data = {
            "message": "If an account with that email exists, a password reset link has been generated.",
        }

        if not user:
            return Response(response_data)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = settings.PASSWORD_RESET_URL.format(uid=uid, token=token)

        send_mail(
            subject="Reset your password",
            message=f"Use this link to reset your password: {reset_url}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        if settings.DEBUG:
            response_data["reset"] = {
                "uid": uid,
                "token": token,
                "url": reset_url,
            }

        return Response(response_data)


class ResetPasswordView(SafeAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer)

        try:
            user_id = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.filter(pk=user_id, active=True).first()
        except (TypeError, ValueError, OverflowError):
            user = None

        if not user or not default_token_generator.check_token(user, serializer.validated_data["token"]):
            return Response({"error": "Invalid or expired reset link."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])

        return Response({"message": "Password reset successful."})


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
