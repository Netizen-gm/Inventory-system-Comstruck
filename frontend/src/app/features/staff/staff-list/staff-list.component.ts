import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaffService } from '../../../core/services/staff.service';
import { Staff, CreateStaffRequest, UpdateStaffRequest } from '../../../core/models/staff.model';
import { StaffFormComponent } from '../staff-form/staff-form.component';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, StaffFormComponent],
  templateUrl: './staff-list.component.html',
  styleUrl: './staff-list.component.scss',
})
export class StaffListComponent implements OnInit {
  private readonly staffService = inject(StaffService);

  staff: Staff[] = [];
  isLoading = true;
  error = '';
  currentPage = 1;
  totalPages = 1;
  total = 0;

  // Form modal state
  showStaffForm = false;
  selectedStaff: Staff | null = null;
  isDeleting = false;
  deletingStaffId: string | null = null;

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.isLoading = true;
    this.error = '';

    this.staffService.getAll({ page: this.currentPage, limit: 10 }).subscribe({
      next: (response) => {
        if (response.data) {
          this.staff = response.data.data;
          this.totalPages = response.data.pagination.totalPages;
          this.total = response.data.pagination.total;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Staff loading error:', error);
        if (error.status === 401) {
          this.error = 'Unauthorized. Please log in again.';
        } else if (error.status === 403) {
          this.error = 'Access denied. You do not have permission to view staff.';
        } else if (error.status === 0) {
          this.error = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          this.error = error.error?.message || error.message || 'Failed to load staff';
        }
        this.isLoading = false;
      },
    });
  }

  openCreateForm(): void {
    this.selectedStaff = null;
    this.showStaffForm = true;
  }

  openEditForm(staff: Staff): void {
    this.selectedStaff = staff;
    this.showStaffForm = true;
  }

  closeStaffForm(): void {
    this.showStaffForm = false;
    this.selectedStaff = null;
  }

  onSaveStaff(staffData: CreateStaffRequest | UpdateStaffRequest): void {
    if (this.selectedStaff) {
      // Update existing staff
      this.staffService.update(this.selectedStaff._id, staffData as UpdateStaffRequest).subscribe({
        next: () => {
          this.closeStaffForm();
          this.loadStaff();
        },
        error: (error) => {
          console.error('Error updating staff:', error);
          alert(error.error?.message || 'Failed to update staff member');
        },
      });
    } else {
      // Create new staff
      this.staffService.create(staffData as CreateStaffRequest).subscribe({
        next: () => {
          this.closeStaffForm();
          this.loadStaff();
        },
        error: (error) => {
          console.error('Error creating staff:', error);
          alert(error.error?.message || 'Failed to create staff member');
        },
      });
    }
  }

  deleteStaff(staff: Staff): void {
    if (!confirm(`Are you sure you want to delete staff member "${staff.employeeId}"? This action cannot be undone.`)) {
      return;
    }

    this.isDeleting = true;
    this.deletingStaffId = staff._id;

    this.staffService.delete(staff._id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.deletingStaffId = null;
        this.loadStaff();
      },
      error: (error) => {
        console.error('Error deleting staff:', error);
        this.isDeleting = false;
        this.deletingStaffId = null;
        alert(error.error?.message || 'Failed to delete staff member');
      },
    });
  }

  viewStaff(staff: Staff): void {
    const details = `
Staff Member: ${this.getUserName(staff)}
Employee ID: ${staff.employeeId}
Department: ${staff.department || 'N/A'}
Position: ${staff.position || 'N/A'}
Status: ${staff.isActive ? 'Active' : 'Inactive'}
${staff.phoneNumber ? `Phone: ${staff.phoneNumber}` : ''}
${staff.address ? `Address: ${staff.address}` : ''}
${staff.salary ? `Salary: $${staff.salary.toFixed(2)}` : ''}
${staff.hireDate ? `Hire Date: ${new Date(staff.hireDate).toLocaleDateString()}` : ''}
    `.trim();
    alert(details);
  }

  getUserName(staff: Staff): string {
    if (typeof staff.userId === 'object' && staff.userId) {
      const firstName = staff.userId.firstName || '';
      const lastName = staff.userId.lastName || '';
      return `${firstName} ${lastName}`.trim() || staff.userId.email;
    }
    return staff.employeeId;
  }
}
