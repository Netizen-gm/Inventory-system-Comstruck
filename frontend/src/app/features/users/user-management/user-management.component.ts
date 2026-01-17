import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User, UserRole, ApprovalStatus } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit {
  private readonly userService = inject(UserService);

  // All users
  users: User[] = [];
  isLoading = false;
  error = '';
  currentPage = 1;
  totalPages = 1;
  total = 0;

  // Pending managers
  pendingManagers: User[] = [];
  isLoadingPending = false;
  pendingError = '';

  // Filters
  selectedRole: UserRole | '' = '';
  selectedApprovalStatus: ApprovalStatus | '' = '';
  selectedActiveStatus: boolean | '' = '';
  searchTerm = '';

  // Role assignment
  selectedUser: User | null = null;
  newRole: UserRole = UserRole.USER;
  isUpdatingRole = false;

  // Approval
  isApproving = false;
  approvingUserId: string | null = null;

  // Status update
  isUpdatingStatus = false;
  updatingStatusUserId: string | null = null;

  readonly UserRole = UserRole;
  readonly ApprovalStatus = ApprovalStatus;

  ngOnInit(): void {
    this.loadPendingManagers();
    this.loadUsers();
  }

  loadPendingManagers(): void {
    this.isLoadingPending = true;
    this.pendingError = '';

    this.userService.getPendingManagers().subscribe({
      next: (response) => {
        if (response.data) {
          this.pendingManagers = response.data;
        }
        this.isLoadingPending = false;
      },
      error: (error) => {
        console.error('Pending managers loading error:', error);
        this.pendingError = error.error?.message || error.message || 'Failed to load pending managers';
        this.isLoadingPending = false;
      },
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = '';

    const params: any = {
      page: this.currentPage,
      limit: 10,
    };

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }
    if (this.selectedRole) {
      params.role = this.selectedRole;
    }
    if (this.selectedApprovalStatus) {
      params.approvalStatus = this.selectedApprovalStatus;
    }
    if (this.selectedActiveStatus !== '') {
      params.isActive = this.selectedActiveStatus;
    }

    this.userService.getAll(params).subscribe({
      next: (response) => {
        if (response.data) {
          this.users = response.data.data;
          this.totalPages = response.data.pagination.totalPages;
          this.total = response.data.pagination.total;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Users loading error:', error);
        if (error.status === 401) {
          this.error = 'Unauthorized. Please log in again.';
        } else if (error.status === 403) {
          this.error = 'Access denied. You do not have permission to manage users.';
        } else if (error.status === 0) {
          this.error = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          this.error = error.error?.message || error.message || 'Failed to load users';
        }
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  clearFilters(): void {
    this.selectedRole = '';
    this.selectedApprovalStatus = '';
    this.selectedActiveStatus = '';
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadUsers();
  }

  approveManager(userId: string, approved: boolean): void {
    if (this.isApproving) return;

    this.isApproving = true;
    this.approvingUserId = userId;

    this.userService.approveManager(userId, { approved }).subscribe({
      next: () => {
        this.loadPendingManagers();
        this.loadUsers();
        this.isApproving = false;
        this.approvingUserId = null;
      },
      error: (error) => {
        console.error('Approval error:', error);
        alert(error.error?.message || error.message || 'Failed to update approval status');
        this.isApproving = false;
        this.approvingUserId = null;
      },
    });
  }

  openRoleDialog(user: User): void {
    this.selectedUser = user;
    this.newRole = user.role;
  }

  closeRoleDialog(): void {
    this.selectedUser = null;
    this.newRole = UserRole.USER;
  }

  updateUserRole(): void {
    if (!this.selectedUser || this.isUpdatingRole) return;

    if (this.selectedUser.role === this.newRole) {
      this.closeRoleDialog();
      return;
    }

    this.isUpdatingRole = true;

    this.userService.updateUserRole(this.selectedUser._id, { role: this.newRole }).subscribe({
      next: () => {
        this.loadUsers();
        this.closeRoleDialog();
        this.isUpdatingRole = false;
      },
      error: (error) => {
        console.error('Role update error:', error);
        alert(error.error?.message || error.message || 'Failed to update user role');
        this.isUpdatingRole = false;
      },
    });
  }

  toggleUserStatus(user: User): void {
    if (this.isUpdatingStatus) return;

    const newStatus = !user.isActive;
    const confirmMessage = newStatus
      ? `Are you sure you want to activate ${user.email}?`
      : `Are you sure you want to deactivate ${user.email}?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.isUpdatingStatus = true;
    this.updatingStatusUserId = user._id;

    this.userService.updateUserStatus(user._id, { isActive: newStatus }).subscribe({
      next: () => {
        this.loadUsers();
        this.isUpdatingStatus = false;
        this.updatingStatusUserId = null;
      },
      error: (error) => {
        console.error('Status update error:', error);
        alert(error.error?.message || error.message || 'Failed to update user status');
        this.isUpdatingStatus = false;
        this.updatingStatusUserId = null;
      },
    });
  }

  getUserName(user: User): string {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email;
  }

  getRoleDisplayName(role: UserRole): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  getApprovalStatusDisplay(status?: ApprovalStatus): string {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }
}
