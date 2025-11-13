import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-quick-actions',
  imports: [],
  templateUrl: './quick-actions.html',
  styleUrl: './quick-actions.scss',
})
export class QuickActions {
  @Output() createTask = new EventEmitter<void>();
  @Output() viewAllTasks = new EventEmitter<void>();
  @Output() generateReport = new EventEmitter<void>();

  onCreateTask(): void {
    this.createTask.emit();
  }

  onViewAllTasks(): void {
    this.viewAllTasks.emit();
  }

  onGenerateReport(): void {
    this.generateReport.emit();
  }
}
