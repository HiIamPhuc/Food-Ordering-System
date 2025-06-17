from django.urls import path
from .views import (
    UserRegistrationView, UserLoginView, UserProfileView, PasswordChangeView,
    logout_view, user_stats_view, health_check
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Health check
    path('health/', health_check, name='health-check'),
    
    # Authentication endpoints
    path('auth/register/', UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', UserLoginView.as_view(), name='user-login'),
    path('auth/logout/', logout_view, name='user-logout'),
    path('auth/change-password/', PasswordChangeView.as_view(), name='change-password'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile endpoints
    path('users/profile/', UserProfileView.as_view(), name='user-profile'),
    path('users/stats/', user_stats_view, name='user-stats'),
]