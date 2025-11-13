import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService, Notification } from '../../services';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notifications-container">
      <!-- Notification Count Header -->
      <div class="notification-header">
        <h2>
          Notifications
          <span class="notification-count">
            {{ notifications().length }}
          </span>
        </h2>
        <div class="header-actions">
          <button (click)="clearAll()" class="clear-btn">Clear all</button>
        </div>
      </div>

      <!-- No Notifications State -->
      <div *ngIf="notifications().length === 0" class="empty-state">
        <div class="empty-content">
          <div class="empty-icon">🔔</div>
          <h3>No notifications</h3>
          <p>You're all caught up!</p>
        </div>
      </div>

      <!-- Notifications List -->
      <div *ngIf="notifications().length > 0" class="notifications-list">
        <div
          *ngFor="let notification of filteredNotifications(); trackBy: trackByNotificationId"
          class="notification-item"
          [ngClass]="getNotificationClasses(notification)"
        >
          <div class="notification-icon">
            {{ getNotificationIcon(notification.type) }}
          </div>

          <div class="notification-content">
            <div class="notification-title">
              {{ notification.title }}
            </div>
            <div class="notification-message">
              {{ notification.message }}
            </div>
            <div class="notification-timestamp">
              {{ formatTime(notification.timestamp) }}
            </div>
          </div>

          <div class="notification-actions">
            <button
              (click)="removeNotification(notification.id)"
              class="action-btn action-btn-remove"
              title="Remove notification"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div *ngIf="notifications().length > 5" class="notification-filters">
        <select [(ngModel)]="filterType" (ngModelChange)="applyFilter()">
          <option value="all">All notifications</option>
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>
    </div>
  `,
  styles: [
    `
      .notifications-container {
        max-width: 48rem;
        margin: 0 auto;
        padding: 1rem;
      }

      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .notification-header h2 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #111827;
      }

      .notification-count {
        margin-left: 0.5rem;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        background-color: #dbeafe;
        color: #1e40af;
        border-radius: 9999px;
      }

      .header-actions {
        display: flex;
        gap: 0.5rem;
      }

      .clear-btn {
        font-size: 0.875rem;
        color: #dc2626;
        background: none;
        border: none;
        cursor: pointer;
      }

      .clear-btn:hover {
        color: #b91c1c;
      }

      .empty-state {
        background-color: #f9fafb;
        border-radius: 0.5rem;
        border: 2px dashed #d1d5db;
      }

      .empty-content {
        text-align: center;
        padding: 2rem 0;
      }

      .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }

      .empty-content h3 {
        font-size: 1.125rem;
        font-weight: 500;
        color: #111827;
        margin-bottom: 0.5rem;
      }

      .empty-content p {
        color: #6b7280;
      }

      .notifications-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .notification-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
        background: white;
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
        border-left: 4px solid #e5e7eb;
        transition: all 0.2s ease-in-out;
      }

      .notification-item:hover {
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      }

      .notification-item.info {
        border-left-color: #3b82f6;
      }

      .notification-item.success {
        border-left-color: #10b981;
      }

      .notification-item.warning {
        border-left-color: #f59e0b;
      }

      .notification-item.error {
        border-left-color: #ef4444;
      }

      .notification-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
        margin-top: 0.25rem;
      }

      .notification-content {
        flex: 1;
        min-width: 0;
      }

      .notification-title {
        font-weight: 500;
        color: #111827;
        margin-bottom: 0.25rem;
      }

      .notification-message {
        color: #6b7280;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
      }

      .notification-timestamp {
        font-size: 0.75rem;
        color: #9ca3af;
      }

      .notification-actions {
        display: flex;
        gap: 0.25rem;
        flex-shrink: 0;
      }

      .action-btn {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
      }

      .action-btn-remove {
        background-color: #fee2e2;
        color: #dc2626;
      }

      .action-btn-remove:hover {
        background-color: #fecaca;
      }

      .notification-filters {
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
      }

      .notification-filters select {
        padding: 0.5rem 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        background: white;
        color: #111827;
      }
    `,
  ],
})
export class NotificationsComponent implements OnInit {
  filteredNotifications = signal<Notification[]>([]);
  filterType = signal<string>('all');

  constructor(private appState: AppStateService) {}

  get notifications() {
    return this.appState.notifications;
  }

  ngOnInit(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    const filter = this.filterType();
    if (filter === 'all') {
      this.filteredNotifications.set(this.notifications());
    } else {
      this.filteredNotifications.set(this.notifications().filter((n) => n.type === filter));
    }
  }

  removeNotification(notificationId: string): void {
    this.appState.removeNotification(notificationId);
    this.applyFilter();
  }

  clearAll(): void {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.appState.clearAllNotifications();
      this.applyFilter();
    }
  }

  getNotificationClasses(notification: Notification): string {
    return notification.type;
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }
}
