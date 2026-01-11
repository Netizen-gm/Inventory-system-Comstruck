import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  stats: DashboardStats | null = null;
  isLoading = true;
  error = '';
  accessDeniedMessage = '';

  ngOnInit(): void {
    // Check if user was redirected due to insufficient permissions
    const deniedMessage = sessionStorage.getItem('accessDenied');
    if (deniedMessage) {
      this.accessDeniedMessage = deniedMessage;
      sessionStorage.removeItem('accessDenied');
    }
    
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.error = '';

    this.dashboardService.getStats().subscribe({
      next: (response) => {
        if (response.data) {
          this.stats = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load dashboard statistics';
        this.isLoading = false;
      },
    });
  }

  formatCurrency(value: number): string {
    return `D${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}`;
  }
}
