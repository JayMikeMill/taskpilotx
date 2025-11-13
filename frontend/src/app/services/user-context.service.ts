import { Injectable, signal, computed } from '@angular/core';
import { User } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserContextService {
  // Signal-based user state
  private userSignal = signal<User | null>(null);

  // Computed properties for easy access
  readonly currentUser = computed(() => this.userSignal());
  readonly isLoggedIn = computed(() => this.userSignal() !== null);
  readonly fullName = computed(() => {
    const user = this.userSignal();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });
  readonly initials = computed(() => {
    const user = this.userSignal();
    return user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : '';
  });
  readonly avatar = computed(() => {
    const user = this.userSignal();
    return (
      user?.avatar ||
      `https://ui-avatars.com/api/?name=${this.fullName()}&background=3b82f6&color=fff&size=256`
    );
  });

  // Methods to update user state
  setUser(user: User | null): void {
    this.userSignal.set(user);
  }

  updateUser(userData: Partial<User>): void {
    const currentUser = this.userSignal();
    if (currentUser) {
      this.userSignal.set({ ...currentUser, ...userData });
    }
  }

  clearUser(): void {
    this.userSignal.set(null);
  }

  // Helper methods
  getUserProperty<K extends keyof User>(property: K): User[K] | null {
    const user = this.userSignal();
    return user ? user[property] : null;
  }

  hasUser(): boolean {
    return this.userSignal() !== null;
  }
}
