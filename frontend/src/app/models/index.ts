// Re-export all models
export * from './user.model';
export * from './task.model';
export * from './message.model';
export * from './account.model';
export * from './action.model';

// Additional types for forms and responses
export interface TaskFormData {
  title: string;
  description?: string;
  status: import('./task.model').TaskStatus;
  priority: import('./task.model').TaskPriority;
  prompt: string;
  dueDate?: string;
  isActive: boolean;
  maxExecutions: number;
  inputs?: any[];
}

// GraphQL Response types
export interface GetMyTasksResponse {
  myTasks: import('./task.model').Task[];
}

export interface GetTasksByStatusResponse {
  tasksByStatus: import('./task.model').Task[];
}

export interface GetTaskResponse {
  task: import('./task.model').Task;
}

export interface GetMyMessagesResponse {
  myMessages: import('./message.model').Message[];
}

export interface GetUnreadMessagesResponse {
  unreadMessages: import('./message.model').Message[];
}

export interface GetMessagesByTypeResponse {
  messagesByType: import('./message.model').Message[];
}

export interface GetMeResponse {
  me: import('./user.model').User;
}

export interface CreateTaskResponse {
  task?: import('./task.model').Task;
  success: boolean;
  errors?: string[];
}

export interface UpdateTaskResponse {
  task?: import('./task.model').Task;
  success: boolean;
  errors?: string[];
}

export interface DeleteTaskResponse {
  success: boolean;
  errors?: string[];
}

export interface CreateMessageResponse {
  createMessage: {
    message: import('./message.model').Message;
    success: boolean;
    errors?: string[];
  };
}

export interface MarkMessageAsReadResponse {
  message?: import('./message.model').Message;
  success: boolean;
  errors?: string[];
}

export interface SummarizeMessageResponse {
  message?: import('./message.model').Message;
  summary?: string;
  success: boolean;
  errors?: string[];
}

// Stats interfaces (for dashboard)
export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface MessageStats {
  total: number;
  unprocessed: number;
  processed: number;
  failed: number;
}

export interface DashboardStats {
  tasks: TaskStats;
  messages: MessageStats;
  linkedAccounts: number;
  activeActions: number;
}
