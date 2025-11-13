// User interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateJoined?: string;
}

// Task interfaces
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  inputs?: string[];
  prompt?: string;
  actions?: string[];
  settings?: any;
  createdAt: string;
  updatedAt?: string;
  owner: User;
  messages?: Message[];
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  inputs?: string[];
  prompt?: string;
  actions?: string[];
  settings?: any;
}

export interface TaskFormData {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

// Message interfaces
export interface Message {
  id: string;
  title: string;
  content: string;
  summary?: string;
  messageType: MessageType;
  isRead: boolean;
  isArchived: boolean;
  metadata?: any;
  createdAt: string;
  readAt?: string;
  recipient: User;
  sender?: User;
  task?: Task;
}

export type MessageType = 'info' | 'warning' | 'error' | 'success' | 'notification';

export interface MessageInput {
  title: string;
  content: string;
  messageType?: MessageType;
  recipientId: string;
  taskId?: string;
}

// GraphQL Response interfaces
export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
}

export interface MutationResponse<T = any> {
  success: boolean;
  errors?: string[];
  [key: string]: T | boolean | string[] | undefined;
}

export interface CreateTaskResponse extends MutationResponse {
  task?: Task;
}

export interface UpdateTaskResponse extends MutationResponse {
  task?: Task;
}

export interface DeleteTaskResponse extends MutationResponse {}

export interface CreateMessageResponse extends MutationResponse {
  message?: Message;
}

export interface MarkMessageAsReadResponse extends MutationResponse {
  message?: Message;
}

export interface SummarizeMessageResponse extends MutationResponse {
  message?: Message;
}

// Query response interfaces
export interface GetMyTasksResponse {
  myTasks: Task[];
}

export interface GetTasksByStatusResponse {
  tasksByStatus: Task[];
}

export interface GetTaskResponse {
  task: Task;
}

export interface GetMyMessagesResponse {
  myMessages: Message[];
}

export interface GetUnreadMessagesResponse {
  unreadMessages: Message[];
}

export interface GetMessagesByTypeResponse {
  messagesByType: Message[];
}

export interface GetMeResponse {
  me: User;
}

// Stats interfaces (for dashboard)
export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}
