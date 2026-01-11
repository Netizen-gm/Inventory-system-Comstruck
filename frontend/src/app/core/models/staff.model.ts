import { User } from './user.model';

export interface Staff {
  _id: string;
  userId: User | string;
  employeeId: string;
  department?: string;
  position?: string;
  hireDate?: string;
  phoneNumber?: string;
  address?: string;
  salary?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffRequest {
  // Either provide userId OR user details to create a new user
  userId?: string; // Optional: Use existing user
  // User details (if userId not provided, creates new user account)
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  // Staff details
  employeeId: string;
  department?: string;
  position?: string;
  hireDate?: string;
  phoneNumber?: string;
  address?: string;
  salary?: number;
  isActive?: boolean;
}

export interface UpdateStaffRequest {
  employeeId?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  phoneNumber?: string;
  address?: string;
  salary?: number;
  isActive?: boolean;
}

export interface StaffQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  position?: string;
  isActive?: boolean;
}

export interface PaginatedStaffResponse {
  data: Staff[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
