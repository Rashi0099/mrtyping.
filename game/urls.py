from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    RegisterView, ProfileView, TypingResultListCreateView, 
    LevelCompletionListCreateView, LeaderboardView
)
from .admin_views import AdminUsersView
from .views_google import GoogleLogin

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
    
    # User Profile
    path('profile/', ProfileView.as_view(), name='profile'),
    
    # Game data
    path('results/', TypingResultListCreateView.as_view(), name='typing_results'),
    path('levels/', LevelCompletionListCreateView.as_view(), name='level_completions'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    
    # Admin
    path('admin/users/', AdminUsersView.as_view(), name='admin_users'),
]
