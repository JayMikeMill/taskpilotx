import { Component } from '@angular/core';
import { Navbar } from './navbar/navbar';
import { Header } from '../../components/header/header';
import { WelcomeSection } from '../../components/dashboard/welcome-section/welcome-section';
import { StatsCards, TaskStats } from '../../components/dashboard/stats-cards/stats-cards';
import { RecentTasks, Task } from '../../components/dashboard/recent-tasks/recent-tasks';
import { QuickActions } from '../../components/dashboard/quick-actions/quick-actions';
import {
  CreateTaskDialog,
  TaskFormData,
} from '../../components/dialogs/create-task/create-task-dialog';

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
export class Dashboard {
  userName = 'John';
  isMobileMenuOpen = false;
  isCreateTaskDialogOpen = false;

  taskStats: TaskStats = {
    total: 24,
    completed: 18,
    pending: 6,
    overdue: 2,
  };

  recentTasks: Task[] = [
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
    console.log('New task created:', taskData);
    // TODO: Add task to the tasks list and update stats
    // For now, let's update the stats as a demo
    this.taskStats = {
      ...this.taskStats,
      total: this.taskStats.total + 1,
      pending: this.taskStats.pending + 1,
    };

    // Add to recent tasks
    const newTask: Task = {
      id: Date.now(), // Simple ID generation
      title: taskData.title,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate).toLocaleDateString() : 'No due date',
      status: taskData.priority === 'high' ? 'high-priority' : 'in-progress',
      completed: false,
    };

    this.recentTasks = [newTask, ...this.recentTasks.slice(0, 2)];
  }

  onViewAllTasks(): void {
    console.log('View all tasks clicked');
    // TODO: Navigate to tasks page
  }

  onGenerateReport(): void {
    console.log('Generate report clicked');
    // TODO: Implement report generation
  }
}
