import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams,
  PaginatedProductResponse,
} from '../models/product.model';
import { ApiResponse } from '../models/api-response.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);

  getAll(
    params?: ProductQueryParams
  ): Observable<ApiResponse<PaginatedProductResponse>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key as keyof ProductQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ApiResponse<PaginatedProductResponse>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.products.base}`,
      { params: httpParams }
    );
  }

  getById(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.products.base}/${id}`
    );
  }

  create(product: CreateProductRequest): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.products.base}`,
      product
    );
  }

  update(
    id: string,
    product: UpdateProductRequest
  ): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.products.base}/${id}`,
      product
    );
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.products.base}/${id}`
    );
  }

  getLowStock(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.products.lowStock}`
    );
  }

  getDashboardStats(): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.products.dashboardStats}`
    );
  }
}
