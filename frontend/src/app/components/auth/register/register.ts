import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerForm = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all fields correctly';
      return;
    }

    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService
      .register(
        this.registerForm.firstName,
        this.registerForm.lastName,
        this.registerForm.email,
        this.registerForm.password
      )
      .subscribe({
        next: (response: any) => {
          console.log('Registration successful', response);
          this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          console.error('Registration failed', error);
          this.errorMessage = 'Registration failed. Please try again.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  isFormValid(): boolean {
    return (
      this.registerForm.firstName.trim().length > 0 &&
      this.registerForm.lastName.trim().length > 0 &&
      this.registerForm.email.trim().length > 0 &&
      this.registerForm.password.trim().length >= 6 &&
      this.registerForm.confirmPassword.trim().length > 0
    );
  }
}
