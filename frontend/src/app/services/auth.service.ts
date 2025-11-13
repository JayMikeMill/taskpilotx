import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

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
  private apiUrl = 'http://localhost:8000/api'; // Django backend URL
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check for existing auth token on service initialization
    this.loadUserFromStorage();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    // For now, simulate login with mock data
    // In production, this would be: return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password });

    return of({
      user: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: email,
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      token: 'mock-jwt-token',
    }).pipe(
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
    // For now, simulate registration with mock data
    // In production, this would be: return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, { firstName, lastName, email, password });

    return of({
      user: {
        id: Date.now(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=3b82f6&color=fff&size=256`,
      },
      token: 'mock-jwt-token',
    }).pipe(
      tap((response) => {
        this.setCurrentUser(response.user);
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('current_user', JSON.stringify(response.user));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
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

  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
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
