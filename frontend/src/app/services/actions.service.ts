import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import type { FetchPolicy } from '@apollo/client/core';
import { Action, ActionExecution, ExecuteActionInput, ActionType } from '../models';

// GraphQL Queries
const GET_AVAILABLE_ACTIONS = gql`
  query GetAvailableActions {
    availableActions {
      id
      name
      actionType
      description
      isActive
      requiresConfig
      configSchema
      createdAt
    }
  }
`;

const GET_ACTION = gql`
  query GetAction($id: ID!) {
    action(id: $id) {
      id
      name
      actionType
      description
      isActive
      requiresConfig
      configSchema
      createdAt
    }
  }
`;

const GET_MY_ACTION_EXECUTIONS = gql`
  query GetMyActionExecutions {
    myActionExecutions {
      id
      status
      configData
      resultData
      errorMessage
      startedAt
      completedAt
      action {
        id
        name
        actionType
        description
      }
      executedBy {
        id
        username
      }
      triggeringTask {
        id
        title
      }
    }
  }
`;

// GraphQL Mutations
const EXECUTE_ACTION = gql`
  mutation ExecuteAction($executionData: ExecuteActionInput!) {
    executeAction(executionData: $executionData) {
      execution {
        id
        status
        configData
        resultData
        errorMessage
        startedAt
        completedAt
        action {
          id
          name
          actionType
        }
      }
      success
      errors
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class ActionsService {
  // Signals for reactive state
  availableActions = signal<Action[]>([]);
  actionExecutions = signal<ActionExecution[]>([]);
  loading = signal<boolean>(false);

  // Action type configurations
  private actionTypeConfigs: Record<ActionType, any> = {
    send_notification: {
      name: 'Send Notification',
      icon: '🔔',
      color: '#3B82F6',
      description: 'Send a notification to the user',
      configSchema: {
        message: { type: 'string', required: true, label: 'Message' },
        urgency: {
          type: 'select',
          required: true,
          label: 'Urgency',
          options: ['low', 'normal', 'high', 'urgent'],
        },
      },
    },
    save_message: {
      name: 'Save Message',
      icon: '💾',
      color: '#10B981',
      description: 'Save the message for later review',
      configSchema: {
        category: { type: 'string', required: false, label: 'Category' },
      },
    },
    send_email: {
      name: 'Send Email',
      icon: '📧',
      color: '#EF4444',
      description: 'Send an email with specified content',
      configSchema: {
        to: { type: 'email', required: true, label: 'To Email' },
        subject: { type: 'string', required: true, label: 'Subject' },
        body: { type: 'textarea', required: true, label: 'Email Body' },
      },
    },
    trigger_task: {
      name: 'Trigger Task',
      icon: '🔄',
      color: '#8B5CF6',
      description: 'Trigger another task to execute',
      configSchema: {
        taskId: { type: 'number', required: true, label: 'Task ID' },
      },
    },
    upload_content: {
      name: 'Upload Content',
      icon: '📤',
      color: '#F59E0B',
      description: 'Upload content to a specified location',
      configSchema: {
        destination: { type: 'string', required: true, label: 'Destination' },
        content: { type: 'textarea', required: true, label: 'Content' },
      },
    },
    forward_message: {
      name: 'Forward Message',
      icon: '↗️',
      color: '#06B6D4',
      description: 'Forward message to another service',
      configSchema: {
        destination: { type: 'string', required: true, label: 'Destination Service' },
        recipient: { type: 'string', required: true, label: 'Recipient' },
      },
    },
    create_task: {
      name: 'Create Task',
      icon: '➕',
      color: '#84CC16',
      description: 'Create a new task based on content',
      configSchema: {
        title: { type: 'string', required: true, label: 'Task Title' },
        priority: {
          type: 'select',
          required: false,
          label: 'Priority',
          options: ['low', 'medium', 'high', 'urgent'],
        },
      },
    },
    summarize_text: {
      name: 'Summarize Text',
      icon: '📝',
      color: '#6366F1',
      description: 'Generate AI summary of text content',
      configSchema: {
        maxLength: { type: 'number', required: false, label: 'Max Summary Length' },
      },
    },
  };

  constructor(private apollo: Apollo) {}

  // Get all available actions
  getAvailableActions(): Observable<Action[]> {
    this.loading.set(true);

    return this.apollo
      .query<{ availableActions: Action[] }>({
        query: GET_AVAILABLE_ACTIONS,
        fetchPolicy: 'cache-and-network' as FetchPolicy,
      })
      .pipe(
        map((result) => {
          const actions = result.data?.availableActions || [];
          this.availableActions.set(actions);
          this.loading.set(false);
          return actions;
        })
      );
  }

  // Get a specific action by ID
  getAction(id: string): Observable<Action | null> {
    return this.apollo
      .query<{ action: Action }>({
        query: GET_ACTION,
        variables: { id },
        fetchPolicy: 'cache-first',
      })
      .pipe(map((result) => result.data?.action || null));
  }

  // Get user's action executions
  getMyActionExecutions(): Observable<ActionExecution[]> {
    this.loading.set(true);

    return this.apollo
      .query<{ myActionExecutions: ActionExecution[] }>({
        query: GET_MY_ACTION_EXECUTIONS,
        fetchPolicy: 'cache-and-network' as FetchPolicy,
      })
      .pipe(
        map((result) => {
          const executions = result.data?.myActionExecutions || [];
          this.actionExecutions.set(executions);
          this.loading.set(false);
          return executions;
        })
      );
  }

  // Execute an action
  executeAction(
    executionData: ExecuteActionInput
  ): Observable<{ execution?: ActionExecution; success: boolean; errors?: string[] }> {
    this.loading.set(true);

    return this.apollo
      .mutate<{
        executeAction: { execution?: ActionExecution; success: boolean; errors?: string[] };
      }>({
        mutation: EXECUTE_ACTION,
        variables: { executionData },
        refetchQueries: [{ query: GET_MY_ACTION_EXECUTIONS }],
      })
      .pipe(
        map((result) => {
          const response = result.data?.executeAction || { success: false };
          this.loading.set(false);

          if (response.success && response.execution) {
            // Update local executions signal
            const currentExecutions = this.actionExecutions();
            this.actionExecutions.set([response.execution, ...currentExecutions]);
          }

          return response;
        })
      );
  }

  // Get action type configuration
  getActionTypeConfig(actionType: ActionType) {
    return this.actionTypeConfigs[actionType];
  }

  // Get all action types with their configs
  getActionTypes(): Array<{ type: ActionType; config: any }> {
    return Object.entries(this.actionTypeConfigs).map(([type, config]) => ({
      type: type as ActionType,
      config,
    }));
  }

  // Filter actions by type
  getActionsByType(actionType: ActionType): Action[] {
    return this.availableActions().filter((action) => action.actionType === actionType);
  }

  // Get recent executions
  getRecentExecutions(limit: number = 10): ActionExecution[] {
    return this.actionExecutions()
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limit);
  }

  // Get execution statistics
  getExecutionStats(): { total: number; completed: number; running: number; failed: number } {
    const executions = this.actionExecutions();

    return {
      total: executions.length,
      completed: executions.filter((e) => e.status === 'completed').length,
      running: executions.filter((e) => e.status === 'running').length,
      failed: executions.filter((e) => e.status === 'failed').length,
    };
  }

  // Validate action configuration
  validateActionConfig(action: Action, configData: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = this.getActionTypeConfig(action.actionType);

    if (!config) {
      return { valid: false, errors: ['Unknown action type'] };
    }

    // Check required fields
    Object.entries(config.configSchema || {}).forEach(([field, schema]: [string, any]) => {
      if (schema.required && (!configData || !configData[field])) {
        errors.push(`${schema.label || field} is required`);
      }

      // Type validation
      if (configData && configData[field]) {
        const value = configData[field];

        switch (schema.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.push(`${schema.label || field} must be a valid email`);
            }
            break;
          case 'number':
            if (isNaN(Number(value))) {
              errors.push(`${schema.label || field} must be a number`);
            }
            break;
          case 'select':
            if (schema.options && !schema.options.includes(value)) {
              errors.push(`${schema.label || field} must be one of: ${schema.options.join(', ')}`);
            }
            break;
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Clear all local state (useful for logout)
  clearState(): void {
    this.availableActions.set([]);
    this.actionExecutions.set([]);
    this.loading.set(false);
  }

  // Simulate action execution for testing
  simulateExecution(actionType: ActionType, configData: any): Observable<any> {
    return new Observable((observer) => {
      setTimeout(() => {
        // Simulate different action results
        switch (actionType) {
          case 'send_notification':
            observer.next({
              notificationSent: true,
              message: configData.message,
              urgency: configData.urgency,
            });
            break;
          case 'send_email':
            observer.next({
              emailSent: true,
              to: configData.to,
              subject: configData.subject,
            });
            break;
          case 'summarize_text':
            observer.next({
              summary: 'AI-generated summary of the content...',
              originalLength: configData.content?.length || 0,
            });
            break;
          default:
            observer.next({ executed: true, timestamp: new Date().toISOString() });
        }
        observer.complete();
      }, Math.random() * 2000 + 500); // Random delay between 0.5-2.5 seconds
    });
  }
}
