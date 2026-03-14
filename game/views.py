from rest_framework import status, views, permissions, generics
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Max, F
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile, TypingResult, LevelCompletion
from .serializers import (
    UserSerializer, ProfileSerializer, TypingResultSerializer, LevelCompletionSerializer
)

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = User.objects.get(username=response.data['username'])
        refresh = RefreshToken.for_user(user)
        response.data['refresh'] = str(refresh)
        response.data['access'] = str(refresh.access_token)
        return response

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        # The frontend calls `getUserProfile(userId)`. 
        # But commonly we just want the logged-in user profile.
        # Let's support both or just logged in for now via /api/profile/
        user_id = self.request.query_params.get('userId')
        if user_id:
            try:
                # the frontend uses UUID typically from supabase. 
                # here we'll use ID if integer.
                profile = Profile.objects.get(user__pk=user_id)
                return profile
            except (ValueError, Profile.DoesNotExist):
                pass
        return self.request.user.profile

class TypingResultListCreateView(generics.ListCreateAPIView):
    serializer_class = TypingResultSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Frontend: getUserResults(userId)
        user_id = self.request.query_params.get('userId')
        if user_id:
            return TypingResult.objects.filter(user_id=user_id).order_by('-created_at')[:50]
        return TypingResult.objects.filter(user=self.request.user).order_by('-created_at')[:50]

class LevelCompletionListCreateView(generics.ListCreateAPIView):
    serializer_class = LevelCompletionSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user_id = self.request.query_params.get('userId')
        if user_id:
            return LevelCompletion.objects.filter(user_id=user_id).order_by('level_number')
        return LevelCompletion.objects.filter(user=self.request.user).order_by('level_number')

class LeaderboardView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        limit = int(request.query_params.get('limit', 20))
        
        # Get distinct users with best wpm
        from django.db import connection
        with connection.cursor() as cursor:
            # Query the best typing result (by max wpm) per user.
            cursor.execute('''
                SELECT user_id, MAX(wpm) as max_wpm, MAX(accuracy) as max_acc
                FROM game_typingresult
                GROUP BY user_id
                ORDER BY max_wpm DESC
                LIMIT %s
            ''', [limit])
            rows = cursor.fetchall()
            
            user_ids = [row[0] for row in rows]
            profiles = Profile.objects.filter(user_id__in=user_ids)
            profile_map = {p.user_id: p.display_name for p in profiles}
            
            entries = []
            for row in rows:
                entries.append({
                    'name': profile_map.get(row[0], 'Anonymous'),
                    'wpm': row[1],
                    'accuracy': row[2]
                })
                
        return Response(entries)
