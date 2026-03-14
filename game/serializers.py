from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, TypingResult, LevelCompletion

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        # Create a default profile
        Profile.objects.create(user=user, display_name=user.username)
        return user

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('id', 'display_name', 'avatar_url', 'bio')

class TypingResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypingResult
        fields = ('id', 'wpm', 'accuracy', 'duration', 'difficulty', 'mistakes', 'created_at')
        read_only_fields = ('id', 'created_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class LevelCompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelCompletion
        fields = ('level_number', 'difficulty', 'wpm', 'accuracy', 'completed_at')
        read_only_fields = ('completed_at',)

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        
        # update or create
        completion, created = LevelCompletion.objects.update_or_create(
            user=validated_data['user'],
            level_number=validated_data['level_number'],
            defaults={
                'difficulty': validated_data['difficulty'],
                'wpm': validated_data['wpm'],
                'accuracy': validated_data['accuracy'],
            }
        )
        return completion
