from django.db import models
from django.contrib.auth.models import User

class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    # Basic info
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    
    # Task status and priority
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    # Dates
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # AI/Automation related fields
    # Inputs this task monitors (sources)
    inputs = models.JSONField(default=list, blank=True)  
    # Example: ["gmail", "discord"]

    # The user-defined instructions for the AI
    prompt = models.TextField(blank=True)

    # List of actions this task can execute
    actions = models.JSONField(default=list, blank=True)
    # Example: ["send_notification", "save_message", "draft_email"]

    # Optional settings or metadata
    settings = models.JSONField(default=dict, blank=True)
    # Example: {"priority": "high", "batch_size": 5}

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.owner.username})"


class Message(models.Model):
    MESSAGE_TYPES = [
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('success', 'Success'),
        ('notification', 'Notification'),
    ]
    
    # Basic info
    title = models.CharField(max_length=255)
    content = models.TextField()
    summary = models.TextField(blank=True, help_text="AI-generated summary of the message content")
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='info')
    
    # Recipients and sender
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages', null=True, blank=True)
    
    # Related task (optional)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.recipient.username}"
