import { Component } from '@angular/core';
import { NotificationsComponent } from '../../components/notifications/notifications.component';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [NotificationsComponent],
  templateUrl: './notifications-page.html',
  styleUrl: './notifications-page.scss',
})
export class NotificationsPage {}
