import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { GraphQLService } from '../../services/graphql.service';
import { Task, TaskStatus, TaskPriority, TaskInput } from '../../models';

@Component({
  selector: 'app-tasks',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private graphqlService = inject(GraphQLService);
  private fb = inject(FormBuilder);

  // State
  tasks = signal<Task[]>([]);
  filteredTasks = signal<Task[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Filters
  statusFilter: TaskStatus | 'all' = 'all';
  priorityFilter: TaskPriority | 'all' = 'all';
  searchQuery = '';

  // Task form
  showCreateForm = signal(false);
  editingTask = signal<Task | null>(null);
  taskForm: FormGroup;

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

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      status: ['pending', Validators.required],
      priority: ['medium', Validators.required],
      dueDate: [''],
      prompt: [''],
      inputs: [[]],
      actions: [[]],
    });
  }

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

  openCreateForm(): void {
    this.editingTask.set(null);
    this.taskForm.reset({
      status: 'pending',
      priority: 'medium',
      inputs: [],
      actions: [],
    });
    this.showCreateForm.set(true);
  }

  openEditForm(task: Task): void {
    this.editingTask.set(task);
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      prompt: task.prompt || '',
      actions: task.actions || [],
    });
    this.showCreateForm.set(true);
  }

  cancelForm(): void {
    this.showCreateForm.set(false);
    this.editingTask.set(null);
    this.taskForm.reset();
  }

  submitTask(): void {
    if (this.taskForm.invalid) return;

    const formValue = this.taskForm.value;
    const taskData: TaskInput = {
      title: formValue.title,
      description: formValue.description,
      status: formValue.status,
      priority: formValue.priority,
      dueDate: formValue.dueDate || undefined,
      prompt: formValue.prompt || undefined,
    };

    const editingTask = this.editingTask();

    if (editingTask) {
      // Update existing task
      this.graphqlService
        .updateTask(editingTask.id, taskData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.loadTasks();
              this.cancelForm();
            } else {
              this.error.set(response.errors?.join(', ') || 'Failed to update task');
            }
          },
          error: (error) => {
            console.error('Error updating task:', error);
            this.error.set('Failed to update task');
          },
        });
    } else {
      // Create new task
      this.graphqlService
        .createTask(taskData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.loadTasks();
              this.cancelForm();
            } else {
              this.error.set(response.errors?.join(', ') || 'Failed to create task');
            }
          },
          error: (error) => {
            console.error('Error creating task:', error);
            this.error.set('Failed to create task');
          },
        });
    }
  }

  deleteTask(task: Task): void {
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

  toggleTaskCompletion(task: Task): void {
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

  getStatusBadgeClass(status: TaskStatus): string {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return statusClasses[status] || statusClasses['pending'];
  }

  getPriorityBadgeClass(priority: TaskPriority): string {
    const priorityClasses = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return priorityClasses[priority] || priorityClasses['medium'];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'completed') return false;
    return new Date(task.dueDate) < new Date();
  }
}
