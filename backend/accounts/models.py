from django.db import models
from django.conf import settings
from cryptography.fernet import Fernet
import base64
import os


class LinkedAccount(models.Model):
    """Model for linked external accounts with encrypted tokens."""
    
    SERVICE_CHOICES = [
        ('gmail', 'Gmail'),
        ('discord', 'Discord'),
        ('slack', 'Slack'),
        ('teams', 'Microsoft Teams'),
        ('telegram', 'Telegram'),
        ('whatsapp', 'WhatsApp Business'),
        ('twitter', 'Twitter'),
        ('linkedin', 'LinkedIn'),
    ]
    
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='linked_accounts')
    service_name = models.CharField(max_length=50, choices=SERVICE_CHOICES)
    account_identifier = models.CharField(max_length=255, help_text="Email, username, or account ID")
    encrypted_token = models.TextField(help_text="Encrypted OAuth token")
    refresh_token = models.TextField(blank=True, null=True, help_text="Encrypted refresh token")
    token_expires_at = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    added_at = models.DateTimeField(auto_now_add=True)
    last_synced_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        unique_together = ('owner', 'service_name', 'account_identifier')
        ordering = ['-added_at']
    
    def __str__(self):
        return f"{self.owner.username} - {self.get_service_name_display()} ({self.account_identifier})"
    
    @staticmethod
    def _get_encryption_key():
        """Get or create encryption key for tokens."""
        key = os.environ.get('ENCRYPTION_KEY')
        if not key:
            # In production, this should be securely stored
            key = base64.urlsafe_b64encode(os.urandom(32)).decode()
            os.environ['ENCRYPTION_KEY'] = key
        return key.encode()
    
    def encrypt_token(self, token):
        """Encrypt a token for storage."""
        if not token:
            return ''
        fernet = Fernet(self._get_encryption_key())
        return fernet.encrypt(token.encode()).decode()
    
    def decrypt_token(self):
        """Decrypt the stored token."""
        if not self.encrypted_token:
            return None
        fernet = Fernet(self._get_encryption_key())
        return fernet.decrypt(self.encrypted_token.encode()).decode()
    
    def set_token(self, token):
        """Set and encrypt token."""
        self.encrypted_token = self.encrypt_token(token)
    
    def set_refresh_token(self, refresh_token):
        """Set and encrypt refresh token."""
        self.refresh_token = self.encrypt_token(refresh_token) if refresh_token else None
