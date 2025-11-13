import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Navbar } from './navbar/navbar';
import { Header } from '../../components/header/header';
import { WelcomeSection } from '../../components/dashboard/welcome-section/welcome-section';
import { StatsCards } from '../../components/dashboard/stats-cards/stats-cards';
import { RecentTasks } from '../../components/dashboard/recent-tasks/recent-tasks';
import { QuickActions } from '../../components/dashboard/quick-actions/quick-actions';
import { CreateTaskDialog } from '../../components/dialogs/create-task/create-task-dialog';
import { GraphQLService } from '../../services/graphql.service';
import { Task, TaskStats, TaskFormData } from '../../models';

@Component({
  selector: 'app-dashboard',
  imports: [
    Navbar,
    Header,
    WelcomeSection,
    StatsCards,
    RecentTasks,
    QuickActions,
    CreateTaskDialog,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private graphqlService = inject(GraphQLService);

  isMobileMenuOpen = false;
  isCreateTaskDialogOpen = false;
  isLoading = true;
  error: string | null = null;

  taskStats: TaskStats = {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  };

  recentTasks: Task[] = [];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      stats: this.graphqlService.getTaskStats(),
      recentTasks: this.graphqlService.getRecentTasks(3),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ stats, recentTasks }) => {
          this.taskStats = stats;
          this.recentTasks = recentTasks;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.error = 'Failed to load dashboard data';
          this.isLoading = false;
        },
      });
  }

  onToggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onCloseMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  onCreateTask(): void {
    this.isCreateTaskDialogOpen = true;
  }

  onCloseCreateTaskDialog(): void {
    this.isCreateTaskDialogOpen = false;
  }

  onTaskCreated(taskData: TaskFormData): void {
    const taskInput = {
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate,
    };

    this.graphqlService
      .createTask(taskInput)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.task) {
            console.log('Task created successfully:', response.task);
            this.onCloseCreateTaskDialog();
            this.loadDashboardData(); // Refresh data
          } else {
            console.error('Failed to create task:', response.errors);
            // Handle error - could show a toast notification
          }
        },
        error: (error) => {
          console.error('Error creating task:', error);
          // Handle error - could show a toast notification
        },
      });
  }

  onViewAllTasks(): void {
    console.log('View all tasks clicked');
    // TODO: Navigate to tasks page
  }

  onGenerateReport(): void {
    console.log('Generate report clicked');
    // TODO: Implement report generation
  }

  onRefreshData(): void {
    this.loadDashboardData();
  }
}
