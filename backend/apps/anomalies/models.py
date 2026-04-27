from django.db import models
from apps.games.models import Game

class Anomaly(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    danger_level = models.IntegerField(default=1)
    type = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class DetectedAnomaly(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='detected_anomalies')
    anomaly = models.ForeignKey(Anomaly, on_delete=models.CASCADE, related_name='detections')
    detected_correctly = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Detected {self.anomaly.name} in Game #{self.game.id}"
