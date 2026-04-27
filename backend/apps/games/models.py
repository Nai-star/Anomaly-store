from django.db import models
from django.conf import settings

class Game(models.Model):
    STATUS_CHOICES = (
        ('playing', 'Playing'),
        ('win', 'Win'),
        ('lose', 'Lose'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='games')
    night_level = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='playing')
    sanity_remaining = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Game #{self.id} - User: {self.user.username}"
