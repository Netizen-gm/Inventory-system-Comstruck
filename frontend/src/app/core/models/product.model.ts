export enum ProductStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  category: string;
  sku: string;
  quantity: number;
  minStock: number;
  maxStock?: number;
  unit: string;
  pricePerUnit: number;
  status: ProductStatus;
  location?: string;
  supplier?: string;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  category: string;
  sku: string;
  quantity: number;
  minStock: number;
  maxStock?: number;
  unit?: string;
  pricePerUnit: number;
  location?: string;
  supplier?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  category?: string;
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  pricePerUnit?: number;
  status?: ProductStatus;
  location?: string;
  supplier?: string;
  lastRestocked?: string;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginatedProductResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
