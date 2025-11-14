import { Component } from '@angular/core';
import { TasksComponent } from '../../components/tasks/tasks.component';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [TasksComponent],
  templateUrl: './tasks-page.html',
  styleUrl: './tasks-page.scss',
})
export class TasksPage {}
