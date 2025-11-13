import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm = {
    email: '',
    password: '',
  };

  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.isFormValid()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService
      .login({
        email: this.loginForm.email,
        password: this.loginForm.password,
      })
      .subscribe({
        next: (response) => {
          console.log('Login successful', response);
          if (response.success && response.user) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = response.errors?.join(', ') || 'Login failed';
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Login failed', error);
          this.errorMessage = 'Invalid email or password';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  isFormValid(): boolean {
    return this.loginForm.email.trim().length > 0 && this.loginForm.password.trim().length > 0;
  }
}
