export interface Message {
  id: string;
  title: string;
  content: string;
  summary?: string;
  status: MessageStatus;
  priority: MessagePriority;
  messageType: MessageType;
  isRead?: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  owner: {
    id: string;
    username: string;
  };
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  task?: {
    id: string;
    title: string;
  };
  sourceAccount: {
    id: string;
    serviceName: string;
    accountIdentifier: string;
  };
  externalMessageId?: string;
  senderInfo?: any;
  aiAnalysis?: any;
}

export type MessageStatus = 'unprocessed' | 'processing' | 'processed' | 'failed';
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';
export type MessageType =
  | 'email'
  | 'chat'
  | 'notification'
  | 'system'
  | 'task_update'
  | 'ai_summary';

export interface MessageInput {
  title: string;
  content: string;
  sourceAccountId: string;
  externalMessageId?: string;
  senderInfo?: any;
  priority?: MessagePriority;
}

export interface MessageThread {
  id: string;
  title: string;
  messages: Message[];
  sourceAccount: {
    id: string;
    serviceName: string;
  };
  externalThreadId?: string;
  createdAt: string;
  updatedAt: string;
}
