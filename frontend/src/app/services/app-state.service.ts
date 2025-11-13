import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task, Message, User } from '../models';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  autoHide?: boolean;
  duration?: number;
}

export interface Breadcrumb {
  label: string;
  route?: string;
}

export interface AppState {
  currentUser: User | null;
  selectedTask: Task | null;
  selectedMessage: Message | null;
  notifications: Notification[];
  breadcrumbs: Breadcrumb[];
  isLoading: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  // Signal-based reactive state
  private appState = signal<AppState>({
    currentUser: null,
    selectedTask: null,
    selectedMessage: null,
    notifications: [],
    breadcrumbs: [],
    isLoading: false,
    connectionStatus: 'disconnected',
  });

  // Computed properties for easy access
  readonly currentUser = computed(() => this.appState().currentUser);
  readonly selectedTask = computed(() => this.appState().selectedTask);
  readonly selectedMessage = computed(() => this.appState().selectedMessage);
  readonly notifications = computed(() => this.appState().notifications);
  readonly breadcrumbs = computed(() => this.appState().breadcrumbs);
  readonly isLoading = computed(() => this.appState().isLoading);
  readonly connectionStatus = computed(() => this.appState().connectionStatus);

  // Computed derived state
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly unreadNotifications = computed(() =>
    this.notifications().filter((n) => n.autoHide !== false)
  );
  readonly hasActiveTask = computed(() => this.selectedTask() !== null);
  readonly hasActiveMessage = computed(() => this.selectedMessage() !== null);

  // BehaviorSubjects for reactive streams (for services that prefer observables)
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Observable streams
  public currentUser$ = this.currentUserSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor() {
    // Sync signals with BehaviorSubjects using effect instead
    // Note: In a real app, you'd use effect() from @angular/core
    // For now, we'll manually sync when values change
  }

  // User management
  setCurrentUser(user: User | null): void {
    this.appState.update((state) => ({
      ...state,
      currentUser: user,
    }));
    this.currentUserSubject.next(user);
  }

  clearCurrentUser(): void {
    this.setCurrentUser(null);
    this.clearSelectedTask();
    this.clearSelectedMessage();
  }

  // Task management
  setSelectedTask(task: Task | null): void {
    this.appState.update((state) => ({
      ...state,
      selectedTask: task,
    }));
  }

  clearSelectedTask(): void {
    this.setSelectedTask(null);
  }

  // Message management
  setSelectedMessage(message: Message | null): void {
    this.appState.update((state) => ({
      ...state,
      selectedMessage: message,
    }));
  }

  clearSelectedMessage(): void {
    this.setSelectedMessage(null);
  }

  // Loading state management
  setLoading(loading: boolean): void {
    this.appState.update((state) => ({
      ...state,
      isLoading: loading,
    }));
    this.loadingSubject.next(loading);
  }

  // Connection status management
  setConnectionStatus(status: 'connected' | 'disconnected' | 'connecting'): void {
    this.appState.update((state) => ({
      ...state,
      connectionStatus: status,
    }));
  }

  // Breadcrumb management
  setBreadcrumbs(breadcrumbs: Breadcrumb[]): void {
    this.appState.update((state) => ({
      ...state,
      breadcrumbs,
    }));
  }

  // Notification management
  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): string {
    const id = this.generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      autoHide: notification.autoHide ?? true,
      duration: notification.duration ?? 5000,
    };

    this.appState.update((state) => ({
      ...state,
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove notification if autoHide is enabled
    if (newNotification.autoHide && newNotification.duration) {
      setTimeout(() => {
        this.removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }

  removeNotification(id: string): void {
    this.appState.update((state) => ({
      ...state,
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  }

  clearAllNotifications(): void {
    this.appState.update((state) => ({
      ...state,
      notifications: [],
    }));
  }

  // Convenience methods for common notification types
  showSuccess(title: string, message: string, duration?: number): string {
    return this.addNotification({
      type: 'success',
      title,
      message,
      duration,
    });
  }

  showError(title: string, message: string, autoHide = false): string {
    return this.addNotification({
      type: 'error',
      title,
      message,
      autoHide,
    });
  }

  showWarning(title: string, message: string, duration?: number): string {
    return this.addNotification({
      type: 'warning',
      title,
      message,
      duration,
    });
  }

  showInfo(title: string, message: string, duration?: number): string {
    return this.addNotification({
      type: 'info',
      title,
      message,
      duration,
    });
  }

  // State persistence methods
  saveStateToStorage(): void {
    const stateToSave = {
      currentUser: this.currentUser(),
      selectedTask: this.selectedTask(),
      selectedMessage: this.selectedMessage(),
    };

    try {
      localStorage.setItem('appState', JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save app state to localStorage:', error);
    }
  }

  loadStateFromStorage(): void {
    try {
      const savedState = localStorage.getItem('appState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);

        this.appState.update((state) => ({
          ...state,
          currentUser: parsedState.currentUser,
          selectedTask: parsedState.selectedTask,
          selectedMessage: parsedState.selectedMessage,
        }));
      }
    } catch (error) {
      console.warn('Failed to load app state from localStorage:', error);
    }
  }

  clearStoredState(): void {
    try {
      localStorage.removeItem('appState');
    } catch (error) {
      console.warn('Failed to clear stored app state:', error);
    }
  }

  // Global state reset
  resetAppState(): void {
    this.appState.set({
      currentUser: null,
      selectedTask: null,
      selectedMessage: null,
      notifications: [],
      breadcrumbs: [],
      isLoading: false,
      connectionStatus: 'disconnected',
    });
    this.clearStoredState();
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Debug methods
  getFullState(): AppState {
    return this.appState();
  }

  logState(): void {
    console.log('Current App State:', this.getFullState());
  }
}
