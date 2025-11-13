from django.db import models
from django.conf import settings


class Message(models.Model):
    """Model for messages received from linked accounts."""
    
    STATUS_CHOICES = [
        ('unprocessed', 'Unprocessed'),
        ('processing', 'Processing'),
        ('processed', 'Processed'),
        ('failed', 'Failed Processing'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='messages')
    title = models.CharField(max_length=255)
    content = models.TextField()
    summary = models.TextField(blank=True, null=True, help_text="AI-generated summary")
    
    # Source information
    source_account = models.ForeignKey('accounts.LinkedAccount', on_delete=models.CASCADE, related_name='messages')
    external_message_id = models.CharField(max_length=255, blank=True, help_text="ID from the source platform")
    sender_info = models.JSONField(default=dict, blank=True, help_text="Information about the sender")
    
    # Processing status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unprocessed')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_at = models.DateTimeField(blank=True, null=True)
    
    # AI Processing
    ai_analysis = models.JSONField(default=dict, blank=True, help_text="AI analysis results")
    triggered_actions = models.ManyToManyField('actions.ActionExecution', blank=True, related_name='triggering_messages')
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('source_account', 'external_message_id')
    
    def __str__(self):
        return f"{self.title} - {self.source_account.service_name} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
    
    @property
    def is_processed(self):
        return self.status == 'processed'
    
    @property
    def has_summary(self):
        return bool(self.summary)


class MessageThread(models.Model):
    """Model for grouping related messages into threads."""
    
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='message_threads')
    title = models.CharField(max_length=255)
    messages = models.ManyToManyField(Message, related_name='threads')
    source_account = models.ForeignKey('accounts.LinkedAccount', on_delete=models.CASCADE, related_name='threads')
    external_thread_id = models.CharField(max_length=255, blank=True, help_text="Thread ID from source platform")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
        unique_together = ('source_account', 'external_thread_id')
    
    def __str__(self):
        return f"{self.title} ({self.messages.count()} messages)"
