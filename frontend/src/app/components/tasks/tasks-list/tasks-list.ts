import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { GraphQLService } from '../../../services/graphql.service';
import { Task, TaskStatus, TaskPriority } from '../../../models';
import { TaskItem } from '../task-item/task-item';
import { LoadingSpinner, ErrorAlert } from '../../../shared/components';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskItem, LoadingSpinner, ErrorAlert],
  templateUrl: './tasks-list.html',
  styleUrl: './tasks-list.scss',
})
export class TasksList implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private graphqlService = inject(GraphQLService);

  // State
  tasks = signal<Task[]>([]);
  filteredTasks = signal<Task[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Filters
  statusFilter: TaskStatus | 'all' = 'all';
  priorityFilter: TaskPriority | 'all' = 'all';
  searchQuery = '';

  // Constants
  readonly statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  readonly priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTasks(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.graphqlService
      .getMyTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          this.tasks.set(tasks);
          this.applyFilters();
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.error.set('Failed to load tasks');
          this.isLoading.set(false);
        },
      });
  }

  applyFilters(): void {
    let filtered = [...this.tasks()];

    // Status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === this.statusFilter);
    }

    // Priority filter
    if (this.priorityFilter !== 'all') {
      filtered = filtered.filter((task) => task.priority === this.priorityFilter);
    }

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
      );
    }

    this.filteredTasks.set(filtered);
  }

  onStatusFilterChange(status: TaskStatus | 'all'): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  onPriorityFilterChange(priority: TaskPriority | 'all'): void {
    this.priorityFilter = priority;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onEditTask(task: Task): void {
    // TODO: Emit event or implement edit logic
    console.log('Edit task:', task);
  }

  onDeleteTask(task: Task): void {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.graphqlService
        .deleteTask(task.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.loadTasks();
            } else {
              this.error.set(response.errors?.join(', ') || 'Failed to delete task');
            }
          },
          error: (error) => {
            console.error('Error deleting task:', error);
            this.error.set('Failed to delete task');
          },
        });
    }
  }

  onToggleTaskCompletion(task: Task): void {
    const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';

    this.graphqlService
      .updateTask(task.id, {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadTasks();
          } else {
            this.error.set(response.errors?.join(', ') || 'Failed to update task');
          }
        },
        error: (error) => {
          console.error('Error updating task:', error);
          this.error.set('Failed to update task');
        },
      });
  }

  onRefreshTasks(): void {
    this.loadTasks();
  }

  onDismissError(): void {
    this.error.set(null);
  }
}
