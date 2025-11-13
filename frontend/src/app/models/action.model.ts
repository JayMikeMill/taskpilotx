export interface Action {
  id: string;
  name: string;
  actionType: ActionType;
  description: string;
  isActive: boolean;
  requiresConfig: boolean;
  configSchema?: any;
  createdAt: string;
}

export type ActionType =
  | 'send_notification'
  | 'save_message'
  | 'send_email'
  | 'trigger_task'
  | 'upload_content'
  | 'forward_message'
  | 'create_task'
  | 'summarize_text';

export interface ActionExecution {
  id: string;
  action: Action;
  status: ActionExecutionStatus;
  configData?: any;
  resultData?: any;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  executedBy: {
    id: string;
    username: string;
  };
  triggeringTask?: {
    id: string;
    title: string;
  };
}

export type ActionExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ExecuteActionInput {
  actionId: string;
  configData?: any;
  taskId?: string;
}
