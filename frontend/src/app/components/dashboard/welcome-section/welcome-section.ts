import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-welcome-section',
  imports: [],
  templateUrl: './welcome-section.html',
  styleUrl: './welcome-section.scss',
})
export class WelcomeSection {
  @Input() userName: string = 'User';
  @Input() subtitle: string = "Here's what's happening with your tasks today.";

  get welcomeMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${this.userName}!`;
    if (hour < 18) return `Good afternoon, ${this.userName}!`;
    return `Good evening, ${this.userName}!`;
  }
}
