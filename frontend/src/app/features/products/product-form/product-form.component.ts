import { Component, EventEmitter, Input, Output, OnInit, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Product, ProductStatus, CreateProductRequest, UpdateProductRequest } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() product: Product | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateProductRequest | UpdateProductRequest>();

  productForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  readonly productStatuses = Object.values(ProductStatus);

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(): void {
    if (this.product && this.isOpen) {
      this.initForm();
    }
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: [this.product?.name || '', [Validators.required, Validators.maxLength(200)]],
      description: [this.product?.description || ''],
      category: [this.product?.category || '', [Validators.required, Validators.maxLength(100)]],
      sku: [this.product?.sku || '', [Validators.required, Validators.maxLength(50)]],
      quantity: [this.product?.quantity || 0, [Validators.required, Validators.min(0)]],
      minStock: [this.product?.minStock || 0, [Validators.required, Validators.min(0)]],
      maxStock: [this.product?.maxStock || null, Validators.min(0)],
      unit: [this.product?.unit || 'bag', [Validators.required, Validators.maxLength(20)]],
      pricePerUnit: [this.product?.pricePerUnit || 0, [Validators.required, Validators.min(0)]],
      status: [this.product?.status || ProductStatus.IN_STOCK],
      location: [this.product?.location || ''],
      supplier: [this.product?.supplier || ''],
    });

    if (this.product) {
      // SKU should not be editable when editing
      this.productForm.get('sku')?.disable();
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.productForm.getRawValue();

    if (this.product) {
      // Update mode
      const updateData: UpdateProductRequest = {
        name: formValue.name,
        description: formValue.description || undefined,
        category: formValue.category,
        quantity: formValue.quantity,
        minStock: formValue.minStock,
        maxStock: formValue.maxStock || undefined,
        unit: formValue.unit,
        pricePerUnit: formValue.pricePerUnit,
        status: formValue.status,
        location: formValue.location || undefined,
        supplier: formValue.supplier || undefined,
      };
      this.save.emit(updateData);
    } else {
      // Create mode
      const createData: CreateProductRequest = {
        name: formValue.name,
        description: formValue.description || undefined,
        category: formValue.category,
        sku: formValue.sku.toUpperCase().trim(),
        quantity: formValue.quantity,
        minStock: formValue.minStock,
        maxStock: formValue.maxStock || undefined,
        unit: formValue.unit,
        pricePerUnit: formValue.pricePerUnit,
        location: formValue.location || undefined,
        supplier: formValue.supplier || undefined,
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
    return !!this.product;
  }
}
