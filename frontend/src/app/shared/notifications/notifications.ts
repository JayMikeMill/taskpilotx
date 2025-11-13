import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class NotificationsComponent {
  private appStateService = inject(AppStateService);

  // Use the computed signal directly from the service
  notifications = this.appStateService.notifications;

  removeNotification(id: string): void {
    this.appStateService.removeNotification(id);
  }
}
