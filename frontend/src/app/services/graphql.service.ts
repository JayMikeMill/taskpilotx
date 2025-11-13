import { Injectable } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  GET_MY_TASKS,
  GET_TASKS_BY_STATUS,
  GET_TASK,
  GET_MY_MESSAGES,
  GET_UNREAD_MESSAGES,
  GET_MESSAGES_BY_TYPE,
  GET_ME,
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  CREATE_MESSAGE,
  MARK_MESSAGE_AS_READ,
  SUMMARIZE_MESSAGE,
} from '../graphql/queries';
import {
  Task,
  TaskInput,
  Message,
  MessageInput,
  User,
  TaskStatus,
  TaskPriority,
  MessageType,
  GetMyTasksResponse,
  GetTasksByStatusResponse,
  GetTaskResponse,
  GetMyMessagesResponse,
  GetUnreadMessagesResponse,
  GetMessagesByTypeResponse,
  GetMeResponse,
  CreateTaskResponse,
  UpdateTaskResponse,
  DeleteTaskResponse,
  CreateMessageResponse,
  MarkMessageAsReadResponse,
  SummarizeMessageResponse,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class GraphQLService {
  constructor(private apollo: Apollo) {}

  // Task Queries
  getMyTasks(): Observable<Task[]> {
    return this.apollo
      .query<GetMyTasksResponse>({
        query: GET_MY_TASKS,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.myTasks || []),
        catchError(this.handleError)
      );
  }

  getTasksByStatus(status: TaskStatus): Observable<Task[]> {
    return this.apollo
      .query<GetTasksByStatusResponse>({
        query: GET_TASKS_BY_STATUS,
        variables: { status },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.tasksByStatus || []),
        catchError(this.handleError)
      );
  }

  getTask(id: string): Observable<Task | null> {
    return this.apollo
      .query<GetTaskResponse>({
        query: GET_TASK,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.task || null),
        catchError(this.handleError)
      );
  }

  // Task Mutations
  createTask(taskData: TaskInput): Observable<CreateTaskResponse> {
    return this.apollo
      .mutate<CreateTaskResponse>({
        mutation: CREATE_TASK,
        variables: { taskData },
        refetchQueries: [{ query: GET_MY_TASKS }],
      })
      .pipe(
        map((result) => result.data?.['createTask'] || { success: false, errors: [] }),
        catchError(this.handleError)
      );
  }

  updateTask(taskId: string, taskData: TaskInput): Observable<UpdateTaskResponse> {
    return this.apollo
      .mutate<UpdateTaskResponse>({
        mutation: UPDATE_TASK,
        variables: { taskId, taskData },
        refetchQueries: [{ query: GET_MY_TASKS }],
      })
      .pipe(
        map((result) => result.data?.['updateTask'] || { success: false, errors: [] }),
        catchError(this.handleError)
      );
  }

  deleteTask(taskId: string): Observable<DeleteTaskResponse> {
    return this.apollo
      .mutate<DeleteTaskResponse>({
        mutation: DELETE_TASK,
        variables: { taskId },
        refetchQueries: [{ query: GET_MY_TASKS }],
      })
      .pipe(
        map((result) => result.data?.['deleteTask'] || { success: false, errors: [] }),
        catchError(this.handleError)
      );
  }

  // Message Queries
  getMyMessages(): Observable<Message[]> {
    return this.apollo
      .query<GetMyMessagesResponse>({
        query: GET_MY_MESSAGES,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.myMessages || []),
        catchError(this.handleError)
      );
  }

  getUnreadMessages(): Observable<Message[]> {
    return this.apollo
      .query<GetUnreadMessagesResponse>({
        query: GET_UNREAD_MESSAGES,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.unreadMessages || []),
        catchError(this.handleError)
      );
  }

  getMessagesByType(messageType: MessageType): Observable<Message[]> {
    return this.apollo
      .query<GetMessagesByTypeResponse>({
        query: GET_MESSAGES_BY_TYPE,
        variables: { messageType },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.messagesByType || []),
        catchError(this.handleError)
      );
  }

  // Message Mutations
  createMessage(messageData: MessageInput): Observable<CreateMessageResponse> {
    return this.apollo
      .mutate<CreateMessageResponse>({
        mutation: CREATE_MESSAGE,
        variables: { messageData },
        refetchQueries: [{ query: GET_MY_MESSAGES }, { query: GET_UNREAD_MESSAGES }],
      })
      .pipe(
        map(
          (result) =>
            result.data?.['createMessage'] || { success: false, errors: ['Unknown error'] }
        ),
        catchError(this.handleError)
      );
  }

  markMessageAsRead(messageId: string): Observable<MarkMessageAsReadResponse> {
    return this.apollo
      .mutate<MarkMessageAsReadResponse>({
        mutation: MARK_MESSAGE_AS_READ,
        variables: { messageId },
        refetchQueries: [{ query: GET_MY_MESSAGES }, { query: GET_UNREAD_MESSAGES }],
      })
      .pipe(
        map(
          (result) =>
            result.data?.['markMessageAsRead'] || { success: false, errors: ['Unknown error'] }
        ),
        catchError(this.handleError)
      );
  }

  summarizeMessage(messageId: string): Observable<SummarizeMessageResponse> {
    return this.apollo
      .mutate<SummarizeMessageResponse>({
        mutation: SUMMARIZE_MESSAGE,
        variables: { messageId },
        refetchQueries: [{ query: GET_MY_MESSAGES }, { query: GET_UNREAD_MESSAGES }],
      })
      .pipe(
        map(
          (result) =>
            result.data?.['summarizeMessage'] || { success: false, errors: ['Unknown error'] }
        ),
        catchError(this.handleError)
      );
  }

  // User Queries
  getMe(): Observable<User | null> {
    return this.apollo
      .query<GetMeResponse>({
        query: GET_ME,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.me || null),
        catchError(this.handleError)
      );
  }

  // Utility Methods
  private handleError = (error: any): Observable<any> => {
    console.error('GraphQL Error:', error);
    throw error;
  };

  // Cache management
  clearCache(): void {
    this.apollo.client.clearStore();
  }

  refetchQueries(): void {
    this.apollo.client.refetchQueries({
      include: 'all',
    });
  }

  // Task status helpers
  getTaskStats(): Observable<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  }> {
    return this.getMyTasks().pipe(
      map((tasks) => {
        const now = new Date();
        return {
          total: tasks.length,
          completed: tasks.filter((task) => task.status === 'completed').length,
          pending: tasks.filter(
            (task) => task.status === 'pending' || task.status === 'in_progress'
          ).length,
          overdue: tasks.filter(
            (task) => task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed'
          ).length,
        };
      })
    );
  }

  // Recent tasks helper
  getRecentTasks(limit: number = 5): Observable<Task[]> {
    return this.getMyTasks().pipe(
      map((tasks) =>
        tasks
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit)
      )
    );
  }
}
