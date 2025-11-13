import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import type { FetchPolicy } from '@apollo/client/core';
import { Task, TaskInput, TaskUpdateInput, TaskStatus } from '../models';

// GraphQL Queries
const GET_MY_TASKS = gql`
  query GetMyTasks {
    myTasks {
      id
      title
      description
      status
      priority
      completed
      prompt
      isActive
      maxExecutions
      executionCount
      createdAt
      updatedAt
      dueDate
      completedAt
      lastExecutedAt
      aiConfig
      owner {
        id
        username
      }
      linkedAccounts {
        id
        serviceName
        accountIdentifier
      }
      actions {
        id
        name
        actionType
        description
      }
    }
  }
`;

const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      status
      priority
      completed
      prompt
      isActive
      maxExecutions
      executionCount
      createdAt
      updatedAt
      dueDate
      completedAt
      lastExecutedAt
      aiConfig
      owner {
        id
        username
      }
      linkedAccounts {
        id
        serviceName
        accountIdentifier
      }
      actions {
        id
        name
        actionType
        description
      }
    }
  }
`;

const GET_TASKS_BY_STATUS = gql`
  query GetTasksByStatus($status: String!) {
    tasksByStatus(status: $status) {
      id
      title
      description
      status
      priority
      completed
      createdAt
      dueDate
    }
  }
`;

// GraphQL Mutations
const CREATE_TASK = gql`
  mutation CreateTask($taskData: TaskInput!) {
    createTask(taskData: $taskData) {
      task {
        id
        title
        description
        status
        priority
        completed
        prompt
        isActive
        maxExecutions
        createdAt
      }
      success
      errors
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($taskId: ID!, $taskData: TaskInput!) {
    updateTask(taskId: $taskId, taskData: $taskData) {
      task {
        id
        title
        description
        status
        priority
        completed
        prompt
        isActive
        maxExecutions
        updatedAt
        completedAt
      }
      success
      errors
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($taskId: ID!) {
    deleteTask(taskId: $taskId) {
      success
      errors
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  // Signals for reactive state
  tasks = signal<Task[]>([]);
  selectedTask = signal<Task | null>(null);
  loading = signal<boolean>(false);

  constructor(private apollo: Apollo) {}

  // Get all tasks for the current user
  getTasks(): Observable<Task[]> {
    this.loading.set(true);

    return this.apollo
      .query<{ myTasks: Task[] }>({
        query: GET_MY_TASKS,
        fetchPolicy: 'cache-and-network' as FetchPolicy,
      })
      .pipe(
        map((result) => {
          const tasks = result.data?.myTasks || [];
          this.tasks.set(tasks);
          this.loading.set(false);
          return tasks;
        })
      );
  }

  // Get a specific task by ID
  getTask(id: string): Observable<Task | null> {
    return this.apollo
      .query<{ task: Task }>({
        query: GET_TASK,
        variables: { id },
        fetchPolicy: 'cache-first',
      })
      .pipe(
        map((result) => {
          const task = result.data?.task || null;
          if (task) {
            this.selectedTask.set(task);
          }
          return task;
        })
      );
  }

  // Get tasks by status
  getTasksByStatus(status: TaskStatus): Observable<Task[]> {
    return this.apollo
      .query<{ tasksByStatus: Task[] }>({
        query: GET_TASKS_BY_STATUS,
        variables: { status },
        fetchPolicy: 'cache-and-network' as FetchPolicy,
      })
      .pipe(map((result) => result.data?.tasksByStatus || []));
  }

  // Create a new task
  createTask(
    taskData: TaskInput
  ): Observable<{ task?: Task; success: boolean; errors?: string[] }> {
    this.loading.set(true);

    return this.apollo
      .mutate<{ createTask: { task?: Task; success: boolean; errors?: string[] } }>({
        mutation: CREATE_TASK,
        variables: { taskData },
        refetchQueries: [{ query: GET_MY_TASKS }],
      })
      .pipe(
        map((result) => {
          const response = result.data?.createTask || { success: false };
          this.loading.set(false);

          if (response.success && response.task) {
            // Update local tasks signal
            const currentTasks = this.tasks();
            this.tasks.set([response.task, ...currentTasks]);
          }

          return response;
        })
      );
  }

  // Update an existing task
  updateTask(
    taskId: string,
    taskData: TaskInput
  ): Observable<{ task?: Task; success: boolean; errors?: string[] }> {
    this.loading.set(true);

    return this.apollo
      .mutate<{ updateTask: { task?: Task; success: boolean; errors?: string[] } }>({
        mutation: UPDATE_TASK,
        variables: { taskId, taskData },
        refetchQueries: [{ query: GET_MY_TASKS }],
      })
      .pipe(
        map((result) => {
          const response = result.data?.updateTask || { success: false };
          this.loading.set(false);

          if (response.success && response.task) {
            // Update local tasks signal
            const currentTasks = this.tasks();
            const updatedTasks = currentTasks.map((task) =>
              task.id === taskId ? response.task! : task
            );
            this.tasks.set(updatedTasks);

            // Update selected task if it's the one being updated
            if (this.selectedTask()?.id === taskId) {
              this.selectedTask.set(response.task);
            }
          }

          return response;
        })
      );
  }

  // Delete a task
  deleteTask(taskId: string): Observable<{ success: boolean; errors?: string[] }> {
    this.loading.set(true);

    return this.apollo
      .mutate<{ deleteTask: { success: boolean; errors?: string[] } }>({
        mutation: DELETE_TASK,
        variables: { taskId },
        refetchQueries: [{ query: GET_MY_TASKS }],
      })
      .pipe(
        map((result) => {
          const response = result.data?.deleteTask || { success: false };
          this.loading.set(false);

          if (response.success) {
            // Update local tasks signal
            const currentTasks = this.tasks();
            this.tasks.set(currentTasks.filter((task) => task.id !== taskId));

            // Clear selected task if it's the one being deleted
            if (this.selectedTask()?.id === taskId) {
              this.selectedTask.set(null);
            }
          }

          return response;
        })
      );
  }

  // Toggle task completion
  toggleTaskCompletion(
    taskId: string
  ): Observable<{ task?: Task; success: boolean; errors?: string[] }> {
    const task = this.tasks().find((t) => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const newStatus: TaskStatus = task.completed ? 'active' : 'completed';

    return this.updateTask(taskId, {
      title: task.title, // Include required title
      status: newStatus,
    });
  }

  // Set selected task
  setSelectedTask(task: Task | null): void {
    this.selectedTask.set(task);
  }

  // Clear all local state (useful for logout)
  clearState(): void {
    this.tasks.set([]);
    this.selectedTask.set(null);
    this.loading.set(false);
  }

  // Get task statistics for dashboard
  getTaskStats(): { total: number; completed: number; active: number; pending: number } {
    const tasks = this.tasks();

    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      active: tasks.filter((t) => t.status === 'active').length,
      pending: tasks.filter((t) => t.status === 'pending').length,
    };
  }
}
