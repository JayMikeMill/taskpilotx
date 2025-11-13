import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Task {
  id: number;
  title: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'high-priority';
  completed: boolean;
}

@Component({
  selector: 'app-recent-tasks',
  imports: [CommonModule],
  templateUrl: './recent-tasks.html',
  styleUrl: './recent-tasks.scss',
})
export class RecentTasks {
  @Input() tasks: Task[] = [
    {
      id: 1,
      title: 'Complete project documentation',
      dueDate: 'Today',
      status: 'in-progress',
      completed: false,
    },
    {
      id: 2,
      title: 'Review code changes',
      dueDate: 'Tomorrow',
      status: 'high-priority',
      completed: false,
    },
    {
      id: 3,
      title: 'Update dependencies',
      dueDate: 'Completed',
      status: 'completed',
      completed: true,
    },
  ];

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'high-priority': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-gray-100 text-gray-800',
    };
    return statusClasses[status] || statusClasses['pending'];
  }

  getStatusText(status: string): string {
    const statusText: { [key: string]: string } = {
      'in-progress': 'In Progress',
      'high-priority': 'High Priority',
      completed: 'Completed',
      pending: 'Pending',
    };
    return statusText[status] || 'Pending';
  }

  toggleTask(task: Task): void {
    task.completed = !task.completed;
    task.status = task.completed ? 'completed' : 'pending';
  }
}
