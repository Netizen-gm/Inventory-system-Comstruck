import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Staff,
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffQueryParams,
  PaginatedStaffResponse,
} from '../models/staff.model';
import { ApiResponse } from '../models/api-response.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  private readonly http = inject(HttpClient);

  getAll(
    params?: StaffQueryParams
  ): Observable<ApiResponse<PaginatedStaffResponse>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key as keyof StaffQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ApiResponse<PaginatedStaffResponse>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.staff.base}`,
      { params: httpParams }
    );
  }

  getById(id: string): Observable<ApiResponse<Staff>> {
    return this.http.get<ApiResponse<Staff>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.staff.base}/${id}`
    );
  }

  create(staff: CreateStaffRequest): Observable<ApiResponse<Staff>> {
    return this.http.post<ApiResponse<Staff>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.staff.base}`,
      staff
    );
  }

  update(
    id: string,
    staff: UpdateStaffRequest
  ): Observable<ApiResponse<Staff>> {
    return this.http.put<ApiResponse<Staff>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.staff.base}/${id}`,
      staff
    );
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.staff.base}/${id}`
    );
  }

  search(
    params?: StaffQueryParams
  ): Observable<ApiResponse<PaginatedStaffResponse>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key as keyof StaffQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ApiResponse<PaginatedStaffResponse>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.staff.search}`,
      { params: httpParams }
    );
  }
}
