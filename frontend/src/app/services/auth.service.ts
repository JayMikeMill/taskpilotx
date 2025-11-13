import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { User, AuthResponse, LoginCredentials, RegisterData } from '../models';

// GraphQL Mutations
const LOGIN_MUTATION = gql`
  mutation Login($credentials: LoginInput!) {
    login(credentials: $credentials) {
      user {
        id
        username
        email
        firstName
        lastName
        displayName
        avatar
        dateJoined
      }
      accessToken
      refreshToken
      success
      errors
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($userData: RegisterInput!) {
    register(userData: $userData) {
      user {
        id
        username
        email
        firstName
        lastName
        displayName
        avatar
        dateJoined
      }
      accessToken
      refreshToken
      success
      errors
    }
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      firstName
      lastName
      displayName
      avatar
      dateJoined
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Signal for reactive components
  currentUser = signal<User | null>(null);
  isLoggedIn = signal<boolean>(false);

  constructor(private apollo: Apollo) {
    // Check for existing auth token on service initialization
    this.loadUserFromStorage();
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.apollo
      .mutate<{ login: AuthResponse }>({
        mutation: LOGIN_MUTATION,
        variables: { credentials },
      })
      .pipe(
        map((result) => result.data?.login!),
        tap((response) => {
          if (response.success && response.user) {
            this.setCurrentUser(response.user);
            this.storeTokens(response.accessToken, response.refreshToken);
            this.storeUser(response.user);
          }
        })
      );
  }

  register(userData: RegisterData): Observable<AuthResponse> {
    return this.apollo
      .mutate<{ register: AuthResponse }>({
        mutation: REGISTER_MUTATION,
        variables: { userData },
      })
      .pipe(
        map((result) => result.data?.register!),
        tap((response) => {
          if (response.success && response.user) {
            this.setCurrentUser(response.user);
            this.storeTokens(response.accessToken, response.refreshToken);
            this.storeUser(response.user);
          }
        })
      );
  }

  logout(): void {
    this.clearStorage();
    this.setCurrentUser(null);
    // Clear Apollo cache
    this.apollo.client.resetStore();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null && this.getAccessToken() !== null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Refresh the user data from server
  refreshUser(): Observable<User | null> {
    if (!this.getAccessToken()) {
      return new Observable((observer) => observer.next(null));
    }

    return this.apollo
      .query<{ me: User }>({
        query: ME_QUERY,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.me || null),
        tap((user) => {
          if (user) {
            this.setCurrentUser(user);
            this.storeUser(user);
          } else {
            this.logout();
          }
        })
      );
  }

  private setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    this.currentUser.set(user);
    this.isLoggedIn.set(user !== null);
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private storeUser(user: User): void {
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  private clearStorage(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
  }

  private loadUserFromStorage(): void {
    const token = this.getAccessToken();
    const userJson = localStorage.getItem('current_user');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        this.setCurrentUser(user);

        // Optionally refresh user data from server
        this.refreshUser().subscribe();
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.logout();
      }
    }
  }

  // Token refresh logic (for when access token expires)
  refreshTokens(): Observable<boolean> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.logout();
      return new Observable((observer) => observer.next(false));
    }

    // In a real app, this would call a refresh token mutation
    // For now, we'll just return false to trigger re-login
    return new Observable((observer) => {
      this.logout();
      observer.next(false);
    });
  }
}
