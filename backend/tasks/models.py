from django.db import models

class Task(models.Model):
    title = models.CharField(max_length=255)
    full_text = models.TextField()
    category = models.CharField(max_length=100, blank=True)
    summary = models.TextField(blank=True)
    suggested_action = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
