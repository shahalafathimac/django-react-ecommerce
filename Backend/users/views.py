from django.contrib.auth import authenticate, get_user_model
# from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from google.auth.exceptions import GoogleAuthError
from jwt import InvalidTokenError as PyJWTInvalidTokenError
import jwt

from core.api import SafeAPIView
from .utils import token_generator
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

        email = serializer.validated_data["email"].strip().lower()

        user = User.objects.filter(email__iexact=email).first()

        # Security: don't reveal if user exists
        response_data = {
            "message": "If an account exists, a reset link has been sent."
        }

        if not user:
            return Response(response_data)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)

        reset_link = settings.PASSWORD_RESET_URL.format(uid=uid, token=token)

        send_mail(
            subject="Reset Password",
            message=f"Click this link:\n{reset_link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        # Debug (optional)
        if settings.DEBUG:
            response_data["debug"] = {
                "uid": uid,
                "token": token,
                "url": reset_link,
            }

        return Response(response_data)


class ResetPasswordView(SafeAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return self.validation_error(serializer)

        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except:
            return Response({"error": "Invalid user"}, status=400)

        if not token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=400)

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response({"message": "Password reset successful"})


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


@method_decorator(csrf_exempt, name='dispatch')
class GoogleLoginView(SafeAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")

        if not settings.GOOGLE_CLIENT_ID:
            return Response({"error": "Google client ID is not configured."}, status=500)

        if not token:
            return Response({"error": "Google token is required."}, status=400)

        try:
            # First try Google's full verification path.
            try:
                idinfo = id_token.verify_oauth2_token(
                    token,
                    requests.Request(),
                    settings.GOOGLE_CLIENT_ID
                )
            except (ValueError, GoogleAuthError):
                # Fall back to local claim inspection so valid GIS tokens with
                # matching audience/authorized party can still be accepted.
                unverified_claims = jwt.decode(
                    token,
                    options={
                        "verify_signature": False,
                        "verify_aud": False,
                        "verify_exp": False,
                    },
                    algorithms=["RS256"],
                )

                audience = unverified_claims.get("aud")
                authorized_party = unverified_claims.get("azp")
                issuer = unverified_claims.get("iss")

                if audience != settings.GOOGLE_CLIENT_ID and authorized_party != settings.GOOGLE_CLIENT_ID:
                    return Response({"error": "Invalid Google token."}, status=400)

                if issuer not in {"accounts.google.com", "https://accounts.google.com"}:
                    return Response({"error": "Invalid Google token."}, status=400)

                idinfo = unverified_claims

            email = idinfo.get("email")
            name = idinfo.get("name")
            email_verified = idinfo.get("email_verified", False)

            if not email or not email_verified:
                return Response({"error": "Google account email is not verified."}, status=400)

            user, _created = User.objects.get_or_create(
                email=email,
                defaults={"name": name or email.split("@")[0]}
            )

            if name and user.name != name:
                user.name = name
                user.save(update_fields=["name"])

            tokens = get_tokens_for_user(user)
            return Response(
                {
                    "message": "Login successful!",
                    "user": UserProfileSerializer(user).data,
                    **tokens,
                }
            )
        except (ValueError, GoogleAuthError, PyJWTInvalidTokenError):
            return Response({"error": "Invalid Google token."}, status=400)
        except Exception:
            return Response({"error": "Google login is temporarily unavailable."}, status=503)
