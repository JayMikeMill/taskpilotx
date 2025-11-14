import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

@Component({
  selector: 'app-task-priority-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      [class]="getBadgeClass()"
    >
      {{ getPriorityLabel() }}
    </span>
  `,
})
export class TaskPriorityBadge {
  @Input({ required: true }) priority!: TaskPriority;

  getBadgeClass(): string {
    const priorityClasses = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return priorityClasses[this.priority] || priorityClasses['medium'];
  }

  getPriorityLabel(): string {
    const priorityLabels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
    };
    return priorityLabels[this.priority] || 'Medium';
  }
}
