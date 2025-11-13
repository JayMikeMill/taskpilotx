import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { GraphQLService } from '../../services/graphql.service';
import { Message, MessageType } from '../../models';

@Component({
  selector: 'app-messages',
  imports: [CommonModule],
  templateUrl: './messages.html',
  styleUrl: './messages.scss',
})
export class MessagesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private graphqlService = inject(GraphQLService);

  messages: Message[] = [];
  unreadMessages: Message[] = [];
  isLoading = true;
  error: string | null = null;
  showUnreadOnly = false;

  ngOnInit(): void {
    this.loadMessages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMessages(): void {
    this.isLoading = true;
    this.error = null;

    const messageQuery = this.showUnreadOnly
      ? this.graphqlService.getUnreadMessages()
      : this.graphqlService.getMyMessages();

    messageQuery.pipe(takeUntil(this.destroy$)).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.error = 'Failed to load messages';
        this.isLoading = false;
      },
    });

    // Load unread count separately
    this.graphqlService
      .getUnreadMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (unreadMessages) => {
          this.unreadMessages = unreadMessages;
        },
        error: (error) => console.error('Error loading unread messages:', error),
      });
  }

  markAsRead(message: Message): void {
    if (message.isRead) return;

    this.graphqlService
      .markMessageAsRead(message.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            message.isRead = true;
            message.readAt = new Date().toISOString();
            this.loadMessages(); // Refresh to update unread count
          }
        },
        error: (error) => console.error('Error marking message as read:', error),
      });
  }

  toggleFilter(): void {
    this.showUnreadOnly = !this.showUnreadOnly;
    this.loadMessages();
  }

  summarizeMessage(message: Message): void {
    if (!message.id) return;

    this.isLoading = true;
    this.graphqlService
      .summarizeMessage(message.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.message) {
            // Update the message in our local array
            const index = this.messages.findIndex((m) => m.id === message.id);
            if (index !== -1) {
              this.messages[index] = response.message;
            }
          } else {
            this.error = response.errors?.join(', ') || 'Failed to summarize message';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error summarizing message:', error);
          this.error = 'Failed to summarize message';
          this.isLoading = false;
        },
      });
  }

  deleteMessage(message: Message): void {
    if (!message.id) return;

    if (confirm('Are you sure you want to delete this message?')) {
      // Note: We need to add deleteMessage to GraphQL service
      console.log('Delete message:', message.id);
      // For now, just remove from local array as a placeholder
      this.messages = this.messages.filter((m) => m.id !== message.id);
      this.unreadMessages = this.unreadMessages.filter((m) => m.id !== message.id);
    }
  }

  archiveMessage(message: Message): void {
    // Placeholder for archive functionality
    console.log('Archive message:', message.id);
  }

  refreshMessages(): void {
    this.loadMessages();
  }

  getMessageTypeClass(messageType: MessageType): string {
    const typeClasses: { [key in MessageType]: string } = {
      email: 'border-l-blue-500 bg-blue-50',
      chat: 'border-l-green-500 bg-green-50',
      notification: 'border-l-purple-500 bg-purple-50',
      system: 'border-l-gray-500 bg-gray-50',
      task_update: 'border-l-orange-500 bg-orange-50',
      ai_summary: 'border-l-cyan-500 bg-cyan-50',
    };
    return typeClasses[messageType] || typeClasses['system'];
  }

  getMessageTypeIcon(messageType: MessageType): string {
    const icons: { [key in MessageType]: string } = {
      email: '📧',
      chat: '💬',
      notification: '🔔',
      system: '⚙️',
      task_update: '📋',
      ai_summary: '🤖',
    };
    return icons[messageType] || icons['system'];
  }

  formatMessageDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }
}
