import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskStatusBadge } from '../../../shared/components/task-status-badge/task-status-badge';
import { TaskPriorityBadge } from '../../../shared/components/task-priority-badge/task-priority-badge';
import { Task } from '../../../models';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, TaskStatusBadge, TaskPriorityBadge],
  templateUrl: './task-item.html',
  styleUrl: './task-item.scss',
})
export class TaskItem {
  @Input({ required: true }) task!: Task;
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<Task>();
  @Output() toggleCompletion = new EventEmitter<Task>();

  onEdit(): void {
    this.edit.emit(this.task);
  }

  onDelete(): void {
    this.delete.emit(this.task);
  }

  onToggleCompletion(): void {
    this.toggleCompletion.emit(this.task);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  isOverdue(): boolean {
    if (!this.task.dueDate || this.task.status === 'completed') return false;
    return new Date(this.task.dueDate) < new Date();
  }
}
