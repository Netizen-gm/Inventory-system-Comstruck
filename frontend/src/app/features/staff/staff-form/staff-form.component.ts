import { Component, EventEmitter, Input, Output, OnInit, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Staff, CreateStaffRequest, UpdateStaffRequest } from '../../../core/models/staff.model';

@Component({
  selector: 'app-staff-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './staff-form.component.html',
  styleUrl: './staff-form.component.scss',
})
export class StaffFormComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() staff: Staff | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateStaffRequest | UpdateStaffRequest>();

  staffForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(): void {
    if (this.staff && this.isOpen) {
      this.initForm();
    }
  }

  private initForm(): void {
    // Get user details from staff if editing
    const userId = this.getUserId();
    const userDetails = userId && typeof this.staff?.userId === 'object' ? this.staff.userId : null;

    this.staffForm = this.fb.group({
      // User account details (only for creating new staff)
      email: [userDetails?.email || '', [Validators.email]],
      password: ['', [Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)]],
      firstName: [userDetails?.firstName || ''],
      lastName: [userDetails?.lastName || ''],
      role: [userDetails?.role || 'user'],
      // Staff details
      employeeId: [this.staff?.employeeId || '', [Validators.required, Validators.maxLength(50)]],
      department: [this.staff?.department || ''],
      position: [this.staff?.position || ''],
      hireDate: [this.staff?.hireDate ? this.formatDateForInput(this.staff.hireDate) : ''],
      phoneNumber: [this.staff?.phoneNumber || ''],
      address: [this.staff?.address || ''],
      salary: [this.staff?.salary || null, Validators.min(0)],
      isActive: [this.staff?.isActive ?? true],
    });

    // When editing, email and password are not editable
    if (this.staff) {
      this.staffForm.get('email')?.disable();
      this.staffForm.get('password')?.clearValidators();
      this.staffForm.get('password')?.updateValueAndValidity();
      this.staffForm.get('firstName')?.disable();
      this.staffForm.get('lastName')?.disable();
      this.staffForm.get('role')?.disable();
    } else {
      // When creating, email and password are required
      this.staffForm.get('email')?.setValidators([Validators.required, Validators.email]);
      this.staffForm.get('password')?.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      ]);
      this.staffForm.get('email')?.updateValueAndValidity();
      this.staffForm.get('password')?.updateValueAndValidity();
    }
  }

  private getUserId(): string {
    if (!this.staff) return '';
    if (typeof this.staff.userId === 'string') {
      return this.staff.userId;
    }
    return this.staff.userId?._id || '';
  }

  private formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.staffForm.invalid) {
      this.markFormGroupTouched(this.staffForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.staffForm.getRawValue();

    if (this.staff) {
      // Update mode
      const updateData: UpdateStaffRequest = {
        employeeId: formValue.employeeId,
        department: formValue.department || undefined,
        position: formValue.position || undefined,
        hireDate: formValue.hireDate || undefined,
        phoneNumber: formValue.phoneNumber || undefined,
        address: formValue.address || undefined,
        salary: formValue.salary || undefined,
        isActive: formValue.isActive,
      };
      this.save.emit(updateData);
    } else {
      // Create mode - use user details to create new user account
      const createData: CreateStaffRequest = {
        email: formValue.email?.toLowerCase().trim(),
        password: formValue.password,
        firstName: formValue.firstName?.trim() || undefined,
        lastName: formValue.lastName?.trim() || undefined,
        role: formValue.role || 'user',
        employeeId: formValue.employeeId,
        department: formValue.department || undefined,
        position: formValue.position || undefined,
        hireDate: formValue.hireDate ? new Date(formValue.hireDate).toISOString() : undefined,
        phoneNumber: formValue.phoneNumber || undefined,
        address: formValue.address || undefined,
        salary: formValue.salary || undefined,
        isActive: formValue.isActive ?? true,
      };
      this.save.emit(createData);
    }
  }

  onCancel(): void {
    this.close.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get isEditMode(): boolean {
    return !!this.staff;
  }
}
