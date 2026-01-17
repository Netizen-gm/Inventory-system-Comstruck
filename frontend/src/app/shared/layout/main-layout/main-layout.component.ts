import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { User, UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);

  user: User | null = null;
  isMenuOpen = false;

  constructor() {
    this.user = this.authService.getCurrentUser<User>();
  }

  get canAccessStaff(): boolean {
    return this.user?.role === UserRole.ADMIN || this.user?.role === UserRole.MANAGER;
  }

  get canAccessProducts(): boolean {
    return this.user?.role === UserRole.ADMIN || this.user?.role === UserRole.WAREHOUSE;
  }

  get canAccessSales(): boolean {
    return this.user?.role === UserRole.ADMIN || this.user?.role === UserRole.MANAGER;
  }

  get canAccessDashboard(): boolean {
    // All authenticated users can access dashboard
    return !!this.user;
  }

  get canAccessUsers(): boolean {
    return this.user?.role === UserRole.ADMIN;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.tokenStorage.clearTokens();
        this.router.navigate(['/auth/login']);
      },
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
