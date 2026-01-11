import { Staff, IStaff } from '../models/Staff.model';
import { User } from '../models/User.model';
import { AppError } from '../utils/AppError';
import { PAGINATION } from '../utils/constants';
import mongoose from 'mongoose';

export interface CreateStaffInput {
  // Either provide userId OR user details to create a new user
  userId?: string; // Optional: Use existing user
  // User details (if userId not provided, create new user)
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  // Staff details
  employeeId: string;
  department?: string;
  position?: string;
  hireDate?: Date;
  phoneNumber?: string;
  address?: string;
  salary?: number;
}

export interface UpdateStaffInput {
  employeeId?: string;
  department?: string;
  position?: string;
  hireDate?: Date;
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
  data: IStaff[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get all staff with pagination, search, and filters
 */
export const getAllStaff = async (
  queryParams: StaffQueryParams
): Promise<PaginatedStaffResponse> => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    search,
    department,
    position,
    isActive,
  } = queryParams;

  // Validate pagination
  const pageNumber = Math.max(1, parseInt(String(page), 10));
  const limitNumber = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(String(limit), 10))
  );
  const skip = (pageNumber - 1) * limitNumber;

  // Build filter query
  const filter: Record<string, unknown> = {};

  if (isActive !== undefined) {
    filter.isActive = isActive === true || isActive === 'true';
  }

  if (department) {
    filter.department = new RegExp(department, 'i');
  }

  if (position) {
    filter.position = new RegExp(position, 'i');
  }

  // Build search query
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { employeeId: searchRegex },
      { department: searchRegex },
      { position: searchRegex },
    ];
  }

  // Get total count for pagination
  const total = await Staff.countDocuments(filter);

  // Get staff with population and pagination
  const staff = await Staff.find(filter)
    .populate({
      path: 'userId',
      select: 'email firstName lastName role isActive',
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .lean();

  const totalPages = Math.ceil(total / limitNumber);

  return {
    data: staff as IStaff[],
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages,
    },
  };
};

/**
 * Get staff by ID
 */
export const getStaffById = async (id: string): Promise<IStaff> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid staff ID');
  }

  const staff = await Staff.findById(id).populate({
    path: 'userId',
    select: 'email firstName lastName role isActive',
  });

  if (!staff) {
    throw AppError.notFound('Staff not found');
  }

  return staff;
};

/**
 * Create new staff
 */
export const createStaff = async (
  input: CreateStaffInput
): Promise<IStaff> => {
  const { 
    userId, 
    email, 
    password, 
    firstName, 
    lastName, 
    role,
    employeeId, 
    department, 
    position, 
    hireDate, 
    phoneNumber, 
    address, 
    salary 
  } = input;

  let finalUserId: mongoose.Types.ObjectId;

  // If userId is provided, use existing user
  if (userId) {
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw AppError.badRequest('Invalid user ID');
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    finalUserId = new mongoose.Types.ObjectId(userId);
  } else if (email && password) {
    // Create new user account
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw AppError.conflict('User with this email already exists. Please use the existing user ID or choose a different email.');
    }

    // Create new user
    const newUser = await User.create({
      email: email.toLowerCase().trim(),
      password,
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      role: role || 'user',
      isActive: true,
    });

    finalUserId = newUser._id;
  } else {
    throw AppError.badRequest('Either userId or email with password must be provided');
  }

  // Check if staff already exists for this user
  const existingStaff = await Staff.findOne({ userId: finalUserId });
  if (existingStaff) {
    throw AppError.conflict('Staff record already exists for this user');
  }

  // Check if employeeId already exists
  const existingEmployeeId = await Staff.findOne({ employeeId });
  if (existingEmployeeId) {
    throw AppError.conflict('Employee ID already exists');
  }

  // Create staff
  const staff = await Staff.create({
    userId: finalUserId,
    employeeId,
    department,
    position,
    hireDate: hireDate ? new Date(hireDate) : undefined,
    phoneNumber,
    address,
    salary,
  });

  // Populate user data
  await staff.populate({
    path: 'userId',
    select: 'email firstName lastName role isActive',
  });

  return staff;
};

/**
 * Update staff
 */
export const updateStaff = async (
  id: string,
  input: UpdateStaffInput
): Promise<IStaff> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid staff ID');
  }

  const { employeeId, department, position, hireDate, phoneNumber, address, salary, isActive } = input;

  // Check if staff exists
  const staff = await Staff.findById(id);
  if (!staff) {
    throw AppError.notFound('Staff not found');
  }

  // Check if employeeId is being updated and if it already exists
  if (employeeId && employeeId !== staff.employeeId) {
    const existingEmployeeId = await Staff.findOne({ employeeId });
    if (existingEmployeeId) {
      throw AppError.conflict('Employee ID already exists');
    }
  }

  // Update staff
  if (employeeId !== undefined) staff.employeeId = employeeId;
  if (department !== undefined) staff.department = department;
  if (position !== undefined) staff.position = position;
  if (hireDate !== undefined) staff.hireDate = hireDate ? new Date(hireDate) : undefined;
  if (phoneNumber !== undefined) staff.phoneNumber = phoneNumber;
  if (address !== undefined) staff.address = address;
  if (salary !== undefined) staff.salary = salary;
  if (isActive !== undefined) staff.isActive = isActive;

  await staff.save();

  // Populate user data
  await staff.populate({
    path: 'userId',
    select: 'email firstName lastName role isActive',
  });

  return staff;
};

/**
 * Delete staff
 */
export const deleteStaff = async (id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid staff ID');
  }

  const staff = await Staff.findById(id);
  if (!staff) {
    throw AppError.notFound('Staff not found');
  }

  await Staff.findByIdAndDelete(id);
};

/**
 * Search staff
 */
export const searchStaff = async (
  queryParams: StaffQueryParams
): Promise<PaginatedStaffResponse> => {
  return getAllStaff(queryParams);
};
