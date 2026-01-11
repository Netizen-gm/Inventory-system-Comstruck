import { Component, EventEmitter, Input, Output, OnInit, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Sale, PaymentMethod, CreateSaleRequest, UpdateSaleRequest } from '../../../core/models/sale.model';
import { ProductsService } from '../../../core/services/products.service';
import { StaffService } from '../../../core/services/staff.service';
import { Product } from '../../../core/models/product.model';
import { Staff } from '../../../core/models/staff.model';

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sale-form.component.html',
  styleUrl: './sale-form.component.scss',
})
export class SaleFormComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly productsService = inject(ProductsService);
  private readonly staffService = inject(StaffService);

  @Input() sale: Sale | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateSaleRequest | UpdateSaleRequest>();

  saleForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  
  products: Product[] = [];
  staff: Staff[] = [];
  isLoadingProducts = false;
  isLoadingStaff = false;

  readonly paymentMethods = Object.values(PaymentMethod);

  ngOnInit(): void {
    this.loadProducts();
    this.loadStaff();
    this.initForm();
  }

  ngOnChanges(): void {
    if (this.sale && this.isOpen) {
      this.initForm();
    } else if (this.isOpen && !this.sale) {
      this.initForm();
    }
  }

  private loadProducts(): void {
    this.isLoadingProducts = true;
    this.productsService.getAll({ limit: 1000 }).subscribe({
      next: (response) => {
        if (response.data?.data) {
          this.products = response.data.data;
        }
        this.isLoadingProducts = false;
      },
      error: () => {
        this.isLoadingProducts = false;
      },
    });
  }

  private loadStaff(): void {
    this.isLoadingStaff = true;
    this.staffService.getAll({ limit: 1000 }).subscribe({
      next: (response) => {
        if (response.data?.data) {
          this.staff = response.data.data;
        }
        this.isLoadingStaff = false;
      },
      error: () => {
        this.isLoadingStaff = false;
      },
    });
  }

  private initForm(): void {
    const saleDate = this.sale?.saleDate 
      ? this.formatDateForInput(this.sale.saleDate) 
      : new Date().toISOString().split('T')[0];

    this.saleForm = this.fb.group({
      saleDate: [saleDate],
      staffId: [this.getStaffId() || '', [Validators.required]],
      productId: [this.getProductId() || '', [Validators.required]],
      quantity: [this.sale?.quantity || 1, [Validators.required, Validators.min(0.01)]],
      unitPrice: [this.sale?.unitPrice || 0, [Validators.required, Validators.min(0)]],
      customerName: [this.sale?.customerName || ''],
      customerPhone: [this.sale?.customerPhone || ''],
      paymentMethod: [this.sale?.paymentMethod || PaymentMethod.CASH, [Validators.required]],
      notes: [this.sale?.notes || ''],
    });

    // Auto-update unit price when product is selected
    this.saleForm.get('productId')?.valueChanges.subscribe((productId) => {
      const product = this.products.find(p => p._id === productId);
      if (product && !this.sale) {
        // Only auto-set price for new sales
        this.saleForm.patchValue({ unitPrice: product.pricePerUnit });
      }
    });
  }

  private getStaffId(): string {
    if (!this.sale) return '';
    if (typeof this.sale.staffId === 'string') {
      return this.sale.staffId;
    }
    return this.sale.staffId?._id || '';
  }

  private getProductId(): string {
    if (!this.sale) return '';
    if (typeof this.sale.productId === 'string') {
      return this.sale.productId;
    }
    return this.sale.productId?._id || '';
  }

  private formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.saleForm.invalid) {
      this.markFormGroupTouched(this.saleForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.saleForm.value;

    if (this.sale) {
      // Update mode
      const updateData: UpdateSaleRequest = {
        saleDate: formValue.saleDate || undefined,
        staffId: formValue.staffId || undefined,
        productId: formValue.productId || undefined,
        quantity: formValue.quantity,
        unitPrice: formValue.unitPrice,
        customerName: formValue.customerName || undefined,
        customerPhone: formValue.customerPhone || undefined,
        paymentMethod: formValue.paymentMethod,
        notes: formValue.notes || undefined,
      };
      this.save.emit(updateData);
    } else {
      // Create mode
      const createData: CreateSaleRequest = {
        saleDate: formValue.saleDate || undefined,
        staffId: formValue.staffId,
        productId: formValue.productId,
        quantity: formValue.quantity,
        unitPrice: formValue.unitPrice,
        customerName: formValue.customerName || undefined,
        customerPhone: formValue.customerPhone || undefined,
        paymentMethod: formValue.paymentMethod,
        notes: formValue.notes || undefined,
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
    return !!this.sale;
  }

  getSelectedProductPrice(): number {
    const productId = this.saleForm.get('productId')?.value;
    const product = this.products.find(p => p._id === productId);
    return product?.pricePerUnit || 0;
  }

  getStaffDisplayName(member: Staff): string {
    if (typeof member.userId === 'object' && member.userId) {
      const firstName = member.userId.firstName || '';
      const lastName = member.userId.lastName || '';
      const name = `${firstName} ${lastName}`.trim();
      if (name) {
        return `${member.employeeId} - ${name} (${member.userId.email})`;
      }
      return `${member.employeeId} - ${member.userId.email}`;
    }
    return `Staff #${member.employeeId}`;
  }
}
