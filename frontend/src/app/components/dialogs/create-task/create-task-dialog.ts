import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskFormData, TaskPriority } from '../../../models';

@Component({
  selector: 'app-create-task-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-task-dialog.html',
  styleUrl: './create-task-dialog.scss',
})
export class CreateTaskDialog {
  @Input() isOpen = false;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() taskCreated = new EventEmitter<TaskFormData>();

  taskForm: TaskFormData = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  };

  priorities: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
  ];

  onClose() {
    this.closeDialog.emit();
    this.resetForm();
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.taskCreated.emit({ ...this.taskForm });
      this.onClose();
    }
  }

  isFormValid(): boolean {
    return this.taskForm.title.trim().length > 0;
  }

  resetForm() {
    this.taskForm = {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
    };
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
