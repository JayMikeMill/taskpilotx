import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

@Component({
  selector: 'app-stats-cards',
  imports: [CommonModule],
  templateUrl: './stats-cards.html',
  styleUrl: './stats-cards.scss',
})
export class StatsCards {
  @Input() stats: TaskStats = {
    total: 24,
    completed: 18,
    pending: 6,
    overdue: 2,
  };
}
