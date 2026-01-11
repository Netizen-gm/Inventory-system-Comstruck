import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../../core/services/products.service';
import { Product, CreateProductRequest, UpdateProductRequest } from '../../../core/models/product.model';
import { ProductFormComponent } from '../product-form/product-form.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, ProductFormComponent],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
})
export class ProductsListComponent implements OnInit {
  private readonly productsService = inject(ProductsService);

  products: Product[] = [];
  isLoading = true;
  error = '';
  currentPage = 1;
  totalPages = 1;
  total = 0;

  // Form modal state
  showProductForm = false;
  selectedProduct: Product | null = null;
  isDeleting = false;
  deletingProductId: string | null = null;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = '';

    this.productsService.getAll({ page: this.currentPage, limit: 10 }).subscribe({
      next: (response) => {
        if (response.data) {
          this.products = response.data.data;
          this.totalPages = response.data.pagination.totalPages;
          this.total = response.data.pagination.total;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Products loading error:', error);
        if (error.status === 401) {
          this.error = 'Unauthorized. Please log in again.';
        } else if (error.status === 403) {
          this.error = 'Access denied. You do not have permission to view products.';
        } else if (error.status === 0) {
          this.error = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          this.error = error.error?.message || error.message || 'Failed to load products';
        }
        this.isLoading = false;
      },
    });
  }

  openCreateForm(): void {
    this.selectedProduct = null;
    this.showProductForm = true;
  }

  openEditForm(product: Product): void {
    this.selectedProduct = product;
    this.showProductForm = true;
  }

  closeProductForm(): void {
    this.showProductForm = false;
    this.selectedProduct = null;
  }

  onSaveProduct(productData: CreateProductRequest | UpdateProductRequest): void {
    if (this.selectedProduct) {
      // Update existing product
      this.productsService.update(this.selectedProduct._id, productData as UpdateProductRequest).subscribe({
        next: () => {
          this.closeProductForm();
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error updating product:', error);
          alert(error.error?.message || 'Failed to update product');
        },
      });
    } else {
      // Create new product
      this.productsService.create(productData as CreateProductRequest).subscribe({
        next: () => {
          this.closeProductForm();
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error creating product:', error);
          alert(error.error?.message || 'Failed to create product');
        },
      });
    }
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return;
    }

    this.isDeleting = true;
    this.deletingProductId = product._id;

    this.productsService.delete(product._id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.deletingProductId = null;
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        this.isDeleting = false;
        this.deletingProductId = null;
        alert(error.error?.message || 'Failed to delete product');
      },
    });
  }

  viewProduct(product: Product): void {
    // For now, just show an alert with product details
    // In the future, this could open a detail modal or navigate to a detail page
    const details = `
Product: ${product.name}
SKU: ${product.sku}
Category: ${product.category}
Quantity: ${product.quantity} ${product.unit}
Price: ${this.formatCurrency(product.pricePerUnit)}
Status: ${product.status}
${product.description ? `Description: ${product.description}` : ''}
${product.location ? `Location: ${product.location}` : ''}
${product.supplier ? `Supplier: ${product.supplier}` : ''}
    `.trim();
    alert(details);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }
}
