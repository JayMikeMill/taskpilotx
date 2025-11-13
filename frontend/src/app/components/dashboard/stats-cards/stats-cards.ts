import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskStats } from '../../../models';

@Component({
  selector: 'app-stats-cards',
  imports: [CommonModule],
  templateUrl: './stats-cards.html',
  styleUrl: './stats-cards.scss',
})
export class StatsCards {
  @Input() stats: TaskStats = {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  };

  get completionRate(): number {
    if (this.stats.total === 0) return 0;
    return Math.round((this.stats.completed / this.stats.total) * 100);
  }
}
