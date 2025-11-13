from django.db import models
from django.conf import settings
import json


class ActionType(models.TextChoices):
    """Enum for different action types."""
    SEND_NOTIFICATION = 'send_notification', 'Send Notification'
    SAVE_MESSAGE = 'save_message', 'Save Message'
    SEND_EMAIL = 'send_email', 'Send Email'
    TRIGGER_TASK = 'trigger_task', 'Trigger Another Task'
    UPLOAD_CONTENT = 'upload_content', 'Upload Content'
    FORWARD_MESSAGE = 'forward_message', 'Forward Message'
    CREATE_TASK = 'create_task', 'Create Task'
    SUMMARIZE_TEXT = 'summarize_text', 'Summarize Text'


class Action(models.Model):
    """Model representing available actions that can be triggered by tasks."""
    
    name = models.CharField(max_length=100, unique=True)
    action_type = models.CharField(max_length=50, choices=ActionType.choices)
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    requires_config = models.BooleanField(default=False, help_text="Whether this action requires additional configuration")
    config_schema = models.JSONField(default=dict, blank=True, help_text="JSON schema for action configuration")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_action_type_display()})"


class ActionExecution(models.Model):
    """Model to track action executions."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    action = models.ForeignKey(Action, on_delete=models.CASCADE, related_name='executions')
    executed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    config_data = models.JSONField(default=dict, blank=True, help_text="Configuration used for this execution")
    result_data = models.JSONField(default=dict, blank=True, help_text="Result data from execution")
    error_message = models.TextField(blank=True, null=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    # Reference to the task that triggered this action (optional)
    triggering_task = models.ForeignKey('tasks.Task', on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.action.name} - {self.status} ({self.started_at.strftime('%Y-%m-%d %H:%M')})"
