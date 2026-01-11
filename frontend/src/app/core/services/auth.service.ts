import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
} from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';
import { API_CONFIG } from '../config/api.config';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.login}`,
        credentials
      )
      .pipe(
        tap((response) => {
          if (response.data) {
            this.tokenStorage.setTokens(
              response.data.tokens.accessToken,
              response.data.tokens.refreshToken
            );
            this.tokenStorage.setUser(response.data.user);
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.register}`,
        userData
      )
      .pipe(
        tap((response) => {
          if (response.data) {
            this.tokenStorage.setTokens(
              response.data.tokens.accessToken,
              response.data.tokens.refreshToken
            );
            this.tokenStorage.setUser(response.data.user);
          }
        })
      );
  }

  refreshToken(
    refreshToken: string
  ): Observable<ApiResponse<RefreshTokenResponse>> {
    const request: RefreshTokenRequest = { refreshToken };
    return this.http
      .post<ApiResponse<RefreshTokenResponse>>(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.refresh}`,
        request
      )
      .pipe(
        tap((response) => {
          if (response.data?.accessToken) {
            const currentRefreshToken = this.tokenStorage.getRefreshToken();
            if (currentRefreshToken) {
              this.tokenStorage.setTokens(
                response.data.accessToken,
                currentRefreshToken
              );
            }
          }
        })
      );
  }

  logout(): Observable<ApiResponse<void>> {
    const accessToken = this.tokenStorage.getAccessToken();
    const refreshToken = this.tokenStorage.getRefreshToken();

    if (!accessToken || !refreshToken) {
      this.tokenStorage.clearTokens();
      return new Observable((observer) => {
        observer.next({ status: 'success' } as ApiResponse<void>);
        observer.complete();
      });
    }

    const request: LogoutRequest = {
      accessToken,
      refreshToken,
    };

    return this.http
      .post<ApiResponse<void>>(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.logout}`,
        request
      )
      .pipe(
        tap(() => {
          this.tokenStorage.clearTokens();
        })
      );
  }

  getCurrentUser<T = unknown>(): T | null {
    return this.tokenStorage.getUser<T>();
  }

  isAuthenticated(): boolean {
    return this.tokenStorage.isAuthenticated();
  }
}
