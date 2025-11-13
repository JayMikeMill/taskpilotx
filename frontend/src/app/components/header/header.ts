import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserContextService } from '../../services/user-context.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  @Output() toggleMobileMenu = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);
  protected userContext = inject(UserContextService);

  isUserMenuOpen = false;

  onToggleMobileMenu() {
    this.toggleMobileMenu.emit();
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeUserMenu();
  }
}
