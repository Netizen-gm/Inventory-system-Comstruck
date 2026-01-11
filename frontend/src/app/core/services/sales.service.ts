import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Sale,
  CreateSaleRequest,
  UpdateSaleRequest,
  SaleQueryParams,
  PaginatedSaleResponse,
  DailyReportResponse,
  MonthlyReportResponse,
} from '../models/sale.model';
import { ApiResponse } from '../models/api-response.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private readonly http = inject(HttpClient);

  getAll(
    params?: SaleQueryParams
  ): Observable<ApiResponse<PaginatedSaleResponse>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key as keyof SaleQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ApiResponse<PaginatedSaleResponse>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sales.base}`,
      { params: httpParams }
    );
  }

  getById(id: string): Observable<ApiResponse<Sale>> {
    return this.http.get<ApiResponse<Sale>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sales.base}/${id}`
    );
  }

  create(sale: CreateSaleRequest): Observable<ApiResponse<Sale>> {
    return this.http.post<ApiResponse<Sale>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sales.base}`,
      sale
    );
  }

  update(
    id: string,
    sale: UpdateSaleRequest
  ): Observable<ApiResponse<Sale>> {
    return this.http.put<ApiResponse<Sale>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sales.base}/${id}`,
      sale
    );
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sales.base}/${id}`
    );
  }

  getDailyReport(date?: string): Observable<ApiResponse<DailyReportResponse>> {
    let httpParams = new HttpParams();
    if (date) {
      httpParams = httpParams.set('date', date);
    }
    return this.http.get<ApiResponse<DailyReportResponse>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sales.dailyReport}`,
      { params: httpParams }
    );
  }

  getMonthlyReport(
    month?: number,
    year?: number
  ): Observable<ApiResponse<MonthlyReportResponse>> {
    let httpParams = new HttpParams();
    if (month !== undefined) {
      httpParams = httpParams.set('month', String(month));
    }
    if (year !== undefined) {
      httpParams = httpParams.set('year', String(year));
    }
    return this.http.get<ApiResponse<MonthlyReportResponse>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sales.monthlyReport}`,
      { params: httpParams }
    );
  }
}
