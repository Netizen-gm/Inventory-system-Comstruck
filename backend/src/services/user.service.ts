import { User, IUser, UserRole, ApprovalStatus } from '../models/User.model';
import { AppError } from '../utils/AppError';
import mongoose from 'mongoose';

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  approvalStatus?: ApprovalStatus;
  isActive?: boolean;
}

export interface UpdateUserRoleInput {
  role: UserRole;
}

export interface ApproveManagerInput {
  approved: boolean;
  reason?: string;
}

/**
 * Get all users with pagination and filters
 */
export const getUsers = async (query: GetUsersQuery) => {
  const {
    page = 1,
    limit = 10,
    search,
    role,
    approvalStatus,
    isActive,
  } = query;

  // Build filter
  const filter: any = {};

  if (role) {
    filter.role = role;
  }

  if (approvalStatus) {
    filter.approvalStatus = approvalStatus;
  }

  if (typeof isActive === 'boolean') {
    filter.isActive = isActive;
  }

  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const limitNum = Math.min(limit, 100); // Max 100 items per page

  // Get users and total count
  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    data: users,
    pagination: {
      page,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Get pending manager approvals
 */
export const getPendingManagerApprovals = async () => {
  const pendingManagers = await User.find({
    role: UserRole.MANAGER,
    approvalStatus: ApprovalStatus.PENDING,
  })
    .select('-password')
    .sort({ createdAt: -1 })
    .lean();

  return pendingManagers;
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<IUser | null> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw AppError.badRequest('Invalid user ID');
  }

  const user = await User.findById(userId).select('-password');
  return user;
};

/**
 * Approve or reject a manager registration
 */
export const approveManager = async (
  userId: string,
  input: ApproveManagerInput
): Promise<IUser> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw AppError.badRequest('Invalid user ID');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw AppError.notFound('User not found');
  }

  if (user.role !== UserRole.MANAGER) {
    throw AppError.badRequest('User is not a manager');
  }

  if (user.approvalStatus !== ApprovalStatus.PENDING) {
    throw AppError.badRequest('User approval status is not pending');
  }

  // Update approval status
  user.approvalStatus = input.approved
    ? ApprovalStatus.APPROVED
    : ApprovalStatus.REJECTED;

  await user.save();

  // Return user without password
  const userObject = user.toObject();
  delete userObject.password;

  return userObject as IUser;
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (
  userId: string,
  input: UpdateUserRoleInput
): Promise<IUser> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw AppError.badRequest('Invalid user ID');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw AppError.notFound('User not found');
  }

  // Validate role
  if (!Object.values(UserRole).includes(input.role)) {
    throw AppError.badRequest('Invalid role');
  }

  // If assigning manager role, set approval status to approved (admin is assigning it)
  if (input.role === UserRole.MANAGER && user.role !== UserRole.MANAGER) {
    user.approvalStatus = ApprovalStatus.APPROVED;
  }

  // If removing manager role, clear approval status
  if (user.role === UserRole.MANAGER && input.role !== UserRole.MANAGER) {
    user.approvalStatus = ApprovalStatus.APPROVED; // Reset to approved for other roles
  }

  user.role = input.role;
  await user.save();

  // Return user without password
  const userObject = user.toObject();
  delete userObject.password;

  return userObject as IUser;
};

/**
 * Activate or deactivate a user
 */
export const updateUserStatus = async (
  userId: string,
  isActive: boolean
): Promise<IUser> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw AppError.badRequest('Invalid user ID');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw AppError.notFound('User not found');
  }

  user.isActive = isActive;
  await user.save();

  // Return user without password
  const userObject = user.toObject();
  delete userObject.password;

  return userObject as IUser;
};
