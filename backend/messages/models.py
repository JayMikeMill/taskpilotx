from django.db import models
from django.contrib.postgres.fields import JSONField

from backend.tasks.models import Task

class Message(models.Model):
    owner = models.ForeignKey('auth.User', on_delete=models.CASCADE)

    # The original content or summary created by the AI
    content = models.TextField()

    # Tags or metadata for filtering/search
    tags = JSONField(default=list)
    # Example: ["urgent", "manager", "project_x"]

    # Source of the message (Gmail, Discord, Slack, etc.)
    source = models.CharField(max_length=50)

    # Optional: reference to the task that generated this message
    task = models.ForeignKey(Task, null=True, blank=True, on_delete=models.SET_NULL)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Message ({self.source}) for {self.owner.username}"