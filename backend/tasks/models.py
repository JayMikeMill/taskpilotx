from django.db import models
from django.contrib.postgres.fields import JSONField

class Task(models.Model):
    # Basic info
    name = models.CharField(max_length=255)
    owner = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    
    # Inputs this task monitors (sources)
    inputs = JSONField(default=list)  
    # Example: ["gmail", "discord"]

    # The user-defined instructions for the AI
    prompt = models.TextField()

    # List of actions this task can execute
    actions = JSONField(default=list)
    # Example: ["send_notification", "save_message", "draft_email"]

    # Optional settings or metadata
    settings = JSONField(default=dict)
    # Example: {"priority": "high", "batch_size": 5}

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.owner.username})"
