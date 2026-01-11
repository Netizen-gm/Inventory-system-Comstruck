import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesService } from '../../../core/services/sales.service';
import { Sale, CreateSaleRequest, UpdateSaleRequest } from '../../../core/models/sale.model';
import { SaleFormComponent } from '../sale-form/sale-form.component';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [CommonModule, SaleFormComponent],
  templateUrl: './sales-list.component.html',
  styleUrl: './sales-list.component.scss',
})
export class SalesListComponent implements OnInit {
  private readonly salesService = inject(SalesService);

  sales: Sale[] = [];
  isLoading = true;
  error = '';
  currentPage = 1;
  totalPages = 1;
  total = 0;

  // Form modal state
  showSaleForm = false;
  selectedSale: Sale | null = null;
  isDeleting = false;
  deletingSaleId: string | null = null;

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.isLoading = true;
    this.error = '';

    this.salesService.getAll({ page: this.currentPage, limit: 10 }).subscribe({
      next: (response) => {
        if (response.data) {
          this.sales = response.data.data;
          this.totalPages = response.data.pagination.totalPages;
          this.total = response.data.pagination.total;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Sales loading error:', error);
        if (error.status === 401) {
          this.error = 'Unauthorized. Please log in again.';
        } else if (error.status === 403) {
          this.error = 'Access denied. You do not have permission to view sales.';
        } else if (error.status === 0) {
          this.error = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          this.error = error.error?.message || error.message || 'Failed to load sales';
        }
        this.isLoading = false;
      },
    });
  }

  openCreateForm(): void {
    this.selectedSale = null;
    this.showSaleForm = true;
  }

  openEditForm(sale: Sale): void {
    this.selectedSale = sale;
    this.showSaleForm = true;
  }

  closeSaleForm(): void {
    this.showSaleForm = false;
    this.selectedSale = null;
  }

  onSaveSale(saleData: CreateSaleRequest | UpdateSaleRequest): void {
    if (this.selectedSale) {
      // Update existing sale
      this.salesService.update(this.selectedSale._id, saleData as UpdateSaleRequest).subscribe({
        next: () => {
          this.closeSaleForm();
          this.loadSales();
        },
        error: (error) => {
          console.error('Error updating sale:', error);
          alert(error.error?.message || 'Failed to update sale');
        },
      });
    } else {
      // Create new sale
      this.salesService.create(saleData as CreateSaleRequest).subscribe({
        next: () => {
          this.closeSaleForm();
          this.loadSales();
        },
        error: (error) => {
          console.error('Error creating sale:', error);
          alert(error.error?.message || 'Failed to create sale');
        },
      });
    }
  }

  deleteSale(sale: Sale): void {
    if (!confirm(`Are you sure you want to delete this sale? This will restore the stock. This action cannot be undone.`)) {
      return;
    }

    this.isDeleting = true;
    this.deletingSaleId = sale._id;

    this.salesService.delete(sale._id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.deletingSaleId = null;
        this.loadSales();
      },
      error: (error) => {
        console.error('Error deleting sale:', error);
        this.isDeleting = false;
        this.deletingSaleId = null;
        alert(error.error?.message || 'Failed to delete sale');
      },
    });
  }

  viewSale(sale: Sale): void {
    const details = `
Sale Details:
Date: ${this.formatDate(sale.saleDate)}
Product: ${this.getProductName(sale)}
Quantity: ${sale.quantity}
Unit Price: ${this.formatCurrency(sale.unitPrice)}
Total Amount: ${this.formatCurrency(sale.totalAmount)}
Payment Method: ${sale.paymentMethod}
${sale.customerName ? `Customer: ${sale.customerName}` : ''}
${sale.customerPhone ? `Phone: ${sale.customerPhone}` : ''}
${sale.notes ? `Notes: ${sale.notes}` : ''}
    `.trim();
    alert(details);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  getProductName(sale: Sale): string {
    if (typeof sale.productId === 'object' && sale.productId && 'name' in sale.productId) {
      return sale.productId.name;
    }
    return String(sale.productId);
  }
}

