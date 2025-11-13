from django.db import models
from django.conf import settings


class Task(models.Model):
    """Enhanced Task model for AI-driven automation."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('paused', 'Paused'),
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
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Task status and priority
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    completed = models.BooleanField(default=False)
    
    # AI prompt for automation
    prompt = models.TextField(help_text="AI prompt describing when and how this task should execute")
    
    # Linked accounts this task monitors
    linked_accounts = models.ManyToManyField('accounts.LinkedAccount', blank=True, related_name='monitoring_tasks')
    
    # Actions this task can execute
    actions = models.ManyToManyField('actions.Action', blank=True, related_name='tasks')
    
    # Execution settings
    is_active = models.BooleanField(default=True, help_text="Whether this task is actively monitoring")
    max_executions = models.IntegerField(default=0, help_text="Max executions (0 = unlimited)")
    execution_count = models.IntegerField(default=0, help_text="Number of times this task has executed")
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_executed_at = models.DateTimeField(null=True, blank=True)
    
    # AI processing configuration
    ai_config = models.JSONField(default=dict, blank=True, help_text="AI processing configuration")
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.owner.username})"
    
    @property
    def can_execute(self):
        """Check if task can execute (active, not exceeded max executions)."""
        if not self.is_active or self.completed:
            return False
        if self.max_executions > 0 and self.execution_count >= self.max_executions:
            return False
        return True


class TaskExecution(models.Model):
    """Model to track individual task executions."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'), 
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='executions')
    triggering_message = models.ForeignKey('messages_app.Message', on_delete=models.CASCADE, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    ai_decision = models.JSONField(default=dict, blank=True, help_text="AI decision and reasoning")
    actions_executed = models.ManyToManyField('actions.ActionExecution', blank=True)
    
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.task.title} execution - {self.status} ({self.started_at.strftime('%Y-%m-%d %H:%M')})"
