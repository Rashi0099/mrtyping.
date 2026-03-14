from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()

class AdminUsersView(views.APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        users = User.objects.all().select_related('profile').order_by('-date_joined')
        data = []
        for u in users:
            try:
                prof = u.profile
                data.append({
                    "id": u.id,
                    "email": u.email,
                    "created_at": u.date_joined.isoformat(),
                    "display_name": prof.display_name,
                    "avatar_url": prof.avatar_url,
                    "bio": prof.bio,
                })
            except Profile.DoesNotExist:
                data.append({
                    "id": u.id,
                    "email": u.email,
                    "created_at": u.date_joined.isoformat(),
                    "display_name": u.username,
                    "avatar_url": None,
                    "bio": None,
                })
        return Response(data)

    def post(self, request):
        action = request.query_params.get('action')
        user_id = request.data.get('userId')
        
        if not user_id:
            return Response({"error": "userId required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if action == 'delete':
            # Don't let admin delete themselves
            if user == request.user:
                return Response({"error": "Cannot delete yourself"}, status=status.HTTP_400_BAD_REQUEST)
            user.delete()
            return Response({"message": "User deleted"})
            
        elif action == 'update-profile':
            try:
                profile = user.profile
            except Profile.DoesNotExist:
                profile = Profile(user=user)
                
            display_name = request.data.get('display_name')
            bio = request.data.get('bio')
            
            if display_name is not None:
                profile.display_name = display_name
            if bio is not None:
                profile.bio = bio
                
            profile.save()
            return Response({"message": "Profile updated"})
            
        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
