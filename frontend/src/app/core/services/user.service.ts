import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserRole, ApprovalStatus } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';
import { API_CONFIG } from '../config/api.config';

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  approvalStatus?: ApprovalStatus;
  isActive?: boolean;
}

export interface PaginatedUserResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApproveManagerRequest {
  approved: boolean;
  reason?: string;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);

  getAll(
    params?: UserQueryParams
  ): Observable<ApiResponse<PaginatedUserResponse>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key as keyof UserQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ApiResponse<PaginatedUserResponse>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.base}`,
      { params: httpParams }
    );
  }

  getPendingManagers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.pendingManagers}`
    );
  }

  getById(id: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.base}/${id}`
    );
  }

  approveManager(
    userId: string,
    request: ApproveManagerRequest
  ): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.base}/${userId}/approve-manager`,
      request
    );
  }

  updateUserRole(
    userId: string,
    request: UpdateUserRoleRequest
  ): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.base}/${userId}/role`,
      request
    );
  }

  updateUserStatus(
    userId: string,
    request: UpdateUserStatusRequest
  ): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.base}/${userId}/status`,
      request
    );
  }
}
