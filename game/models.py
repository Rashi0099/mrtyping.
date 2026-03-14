from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    pass

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=100)
    avatar_url = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.display_name

class TypingResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='typing_results')
    wpm = models.FloatField()
    accuracy = models.FloatField()
    duration = models.IntegerField()
    difficulty = models.CharField(max_length=50)
    mistakes = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.wpm} WPM - {self.accuracy}%"

class LevelCompletion(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='level_completions')
    level_number = models.IntegerField()
    difficulty = models.CharField(max_length=50)
    wpm = models.FloatField()
    accuracy = models.FloatField()
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'level_number')

    def __str__(self):
        return f"{self.user.username} - Level {self.level_number}"
