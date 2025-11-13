import { Component, Input, computed, inject } from '@angular/core';
import { UserContextService } from '../../../services/user-context.service';

@Component({
  selector: 'app-welcome-section',
  imports: [],
  templateUrl: './welcome-section.html',
  styleUrl: './welcome-section.scss',
})
export class WelcomeSection {
  @Input() subtitle: string = "Here's what's happening with your tasks today.";

  private userContext = inject(UserContextService);

  userName = computed(() => {
    const user = this.userContext.currentUser();
    return user?.first_name || user?.displayName || 'User';
  });

  welcomeMessage = computed(() => {
    const hour = new Date().getHours();
    const name = this.userName();
    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 18) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  });
}
