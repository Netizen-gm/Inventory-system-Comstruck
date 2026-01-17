export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MANAGER = 'manager',
  WAREHOUSE = 'warehouse',
}

export enum ApprovalStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  approvalStatus?: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface LogoutRequest {
  accessToken: string;
  refreshToken: string;
}
