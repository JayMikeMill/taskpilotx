import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../models';

@Component({
  selector: 'app-recent-tasks',
  imports: [CommonModule],
  templateUrl: './recent-tasks.html',
  styleUrl: './recent-tasks.scss',
})
export class RecentTasks {
  @Input() tasks: Task[] = [];

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      in_progress: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return statusClasses[status] || statusClasses['pending'];
  }

  getStatusText(status: string): string {
    const statusText: { [key: string]: string } = {
      in_progress: 'In Progress',
      pending: 'Pending',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return statusText[status] || 'Pending';
  }

  getPriorityClass(priority: string): string {
    const priorityClasses: { [key: string]: string } = {
      low: 'text-gray-600',
      medium: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600',
    };
    return priorityClasses[priority] || priorityClasses['medium'];
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== 'completed';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

    return date.toLocaleDateString();
  }
}
