import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

@Component({
  selector: 'app-task-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      [class]="getBadgeClass()"
    >
      {{ getStatusLabel() }}
    </span>
  `,
})
export class TaskStatusBadge {
  @Input({ required: true }) status!: TaskStatus;

  getBadgeClass(): string {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return statusClasses[this.status] || statusClasses['pending'];
  }

  getStatusLabel(): string {
    const statusLabels = {
      pending: 'Pending',
      in_progress: 'In Progress',
      active: 'Active',
      paused: 'Paused',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return statusLabels[this.status] || 'Unknown';
  }
}
