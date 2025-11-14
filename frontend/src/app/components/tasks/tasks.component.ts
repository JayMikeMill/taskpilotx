import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksList } from './tasks-list/tasks-list';

@Component({
  selector: 'app-tasks',
  imports: [CommonModule, TasksList],
  template: `
    <div class="max-w-7xl mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Task Management</h1>
        <p class="text-gray-600">Organize and track your tasks efficiently</p>
      </div>

      <app-tasks-list></app-tasks-list>
    </div>
  `,
  styleUrl: './tasks.component.scss',
})
export class TasksComponent {}
