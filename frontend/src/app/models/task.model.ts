import type { LinkedAccount } from './account.model';
import type { Action } from './action.model';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  completed: boolean;
  prompt: string;
  isActive: boolean;
  maxExecutions: number;
  executionCount: number;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
  lastExecutedAt?: string;
  aiConfig?: any;
  linkedAccounts?: LinkedAccount[];
  actions?: Action[];
  owner: {
    id: string;
    username: string;
  };
}

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  prompt?: string;
  dueDate?: string;
  isActive?: boolean;
  maxExecutions?: number;
  aiConfig?: any;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  prompt?: string;
  dueDate?: string;
  isActive?: boolean;
  maxExecutions?: number;
  aiConfig?: any;
}

export interface TaskExecution {
  id: string;
  task: Task;
  status: ExecutionStatus;
  aiDecision?: any;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';
