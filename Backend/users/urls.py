from django.urls import path
from .views import (
    CSRFCookieView,
    ForgotPasswordView,
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    ResetPasswordView,
    TokenRefreshCookieView,
    ChangePasswordView,
    UserListCreateView,
    UserDetailView,
)

urlpatterns = [
    path('users/csrf/', CSRFCookieView.as_view(), name='csrf-cookie'),
    path('users/register/', RegisterView.as_view(), name='register'),
    path('users/login/', LoginView.as_view(), name='login'),
    path('users/logout/', LogoutView.as_view(), name='logout'),
    path('users/profile/', ProfileView.as_view(), name='profile'),
    path('users/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('users/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('users/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('users/token/refresh/', TokenRefreshCookieView.as_view(), name='token_refresh'),
    path('users/', UserListCreateView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
]
