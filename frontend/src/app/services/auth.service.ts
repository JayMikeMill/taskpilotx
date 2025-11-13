import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UserContextService } from './user-context.service';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl: string;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private userContext: UserContextService) {
    this.apiUrl = this.getBackendUrl();
    // Check for existing auth token on service initialization
    this.loadUserFromStorage();
  }

  private getBackendUrl(): string {
    // Check if we're running on network interface
    const isNetworkMode =
      window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    return isNetworkMode
      ? `http://${window.location.hostname}:8000/api`
      : 'http://localhost:8000/api';
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<any>(`${this.apiUrl}/users/login/`, {
        email,
        password,
      })
      .pipe(
        map((response) => ({
          user: {
            id: response.user.id,
            firstName: response.user.first_name,
            lastName: response.user.last_name,
            email: response.user.email,
            avatar: `https://ui-avatars.com/api/?name=${response.user.first_name}+${response.user.last_name}&background=3b82f6&color=fff&size=256`,
          },
          token: response.access,
        })),
        tap((response) => {
          this.setCurrentUser(response.user);
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('current_user', JSON.stringify(response.user));
        })
      );
  }

  register(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Observable<AuthResponse> {
    return this.http
      .post<any>(`${this.apiUrl}/users/register/`, {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        password2: password,
      })
      .pipe(
        tap((backendResponse) => {
          const user = {
            id: backendResponse.user.id,
            firstName: backendResponse.user.first_name,
            lastName: backendResponse.user.last_name,
            email: backendResponse.user.email,
            avatar: `https://ui-avatars.com/api/?name=${backendResponse.user.first_name}+${backendResponse.user.last_name}&background=3b82f6&color=fff&size=256`,
          };

          this.setCurrentUser(user);
          localStorage.setItem('auth_token', backendResponse.access);
          localStorage.setItem('refresh_token', backendResponse.refresh);
          localStorage.setItem('current_user', JSON.stringify(user));
        }),
        map((backendResponse) => ({
          user: {
            id: backendResponse.user.id,
            firstName: backendResponse.user.first_name,
            lastName: backendResponse.user.last_name,
            email: backendResponse.user.email,
            avatar: `https://ui-avatars.com/api/?name=${backendResponse.user.first_name}+${backendResponse.user.last_name}&background=3b82f6&color=fff&size=256`,
          },
          token: backendResponse.access,
        }))
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    if (user) {
      this.userContext.setUser(user);
    } else {
      this.userContext.clearUser();
    }
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('current_user');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.logout();
      }
    }
  }

  // Update user profile
  updateProfile(userData: Partial<User>): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    const updatedUser = { ...currentUser, ...userData };

    // In production, this would be an HTTP request
    return of(updatedUser).pipe(
      tap((user) => {
        this.setCurrentUser(user);
        localStorage.setItem('current_user', JSON.stringify(user));
      })
    );
  }
}
