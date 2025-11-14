import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      @if (message) {
      <span class="ml-3 text-gray-600">{{ message }}</span>
      }
    </div>
  `,
})
export class LoadingSpinner {
  @Input() message = 'Loading...';
}
