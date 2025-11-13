// src/app/task-dashboard.component.ts

// ----------------------
// Angular Core Imports
// ----------------------
import { Component, signal, effect } from "@angular/core";
// CommonModule gives us structural directives like *ngIf, *ngFor
import { CommonModule } from "@angular/common";
// FormsModule gives us [(ngModel)] for two-way binding
import { FormsModule } from "@angular/forms";

// ----------------------
// Type Definitions
// ----------------------
interface Task {
  title: string;
  completed: boolean;
  due: Date;
}

// ----------------------
// Main Dashboard Component
// Standalone: means this component does not need an NgModule
// Imports: modules needed for template features (*ngFor, *ngIf, [(ngModel)])
// Selector: the tag to use this component <app-task-dashboard>
// ----------------------
@Component({
  selector: "app-task-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Angular Task Dashboard</h1>

    <!-- Input to add new tasks -->
    <input [(ngModel)]="newTitle" placeholder="New task title" />
    <button (click)="addTask()">Add Task</button>

    <!-- Summary of tasks -->
    <p>Total tasks: {{ tasks().length }}</p>
    <p>Completed: {{ tasks().filter(t => t.completed).length }}</p>

    <!-- Task Cards -->
    <div
      *ngFor="let task of tasks(); let i = index"
      [ngStyle]="{
        'background-color': task.completed ? '#d4edda' : '#fff3cd',
        border: '1px solid #ccc',
        padding: '1rem',
        'margin-bottom': '0.5rem',
        'border-radius': '8px'
      }"
    >
      <!-- Editable Task Title -->
      <h3
        *ngIf="!editing[i]"
        (click)="editing[i] = true"
        [style.textDecoration]="task.completed ? 'line-through' : 'none'"
      >
        {{ task.title }}
      </h3>

      <input
        *ngIf="editing[i]"
        [(ngModel)]="task.title"
        (blur)="editing[i] = false"
      />

      <!-- Formatted Due Date -->
      <p>Due: {{ task.due | date : "EEE, MMM d" }}</p>

      <!-- Toggle completion button -->
      <button (click)="toggleTask(i)">
        {{ task.completed ? "Undo" : "Complete" }}
      </button>
    </div>
  `,
})
export class TaskDashboardComponent {
  // ----------------------
  // Reactive state using Signals
  // tasks() returns the current array of tasks
  // tasks.set([...]) updates the signal and automatically triggers template re-render
  // ----------------------
  tasks = signal<Task[]>([
    { title: "Initial Task", completed: false, due: new Date() },
  ]);

  // ----------------------
  // Track which tasks are being edited
  // Indexed array matching tasks array
  // ----------------------
  editing: boolean[] = [];

  // ----------------------
  // Local state for the input
  // [(ngModel)] binds this to the input field
  // ----------------------
  newTitle = "";

  // ----------------------
  // Add a new task
  // Update the signal by creating a new array (immutability)
  // Reset the input field
  // ----------------------
  addTask() {
    const currentTasks = this.tasks();
    this.tasks.set([
      ...currentTasks,
      { title: this.newTitle, completed: false, due: new Date() },
    ]);
    this.newTitle = "";
  }

  // ----------------------
  // Toggle completion of a task
  // ----------------------
  toggleTask(index: number) {
    const currentTasks = this.tasks();
    currentTasks[index].completed = !currentTasks[index].completed;
    // Must call set() to trigger reactive update
    this.tasks.set([...currentTasks]);
  }

  // ----------------------
  // Lifecycle effect
  // Runs whenever tasks() signal changes
  // Similar to React's useEffect(() => {...}, [tasks])
  // ----------------------
  constructor() {
    effect(() => {
      console.log("Tasks updated:", this.tasks());
    });
  }
}
