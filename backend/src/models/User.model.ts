/**
 * User Model
 * 
 * Defines the User schema for MongoDB with Mongoose.
 * Handles user authentication, role-based access control, and manager approval workflow.
 */

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * User roles enum
 * Defines the available user roles in the system
 * - USER: Default role with basic access
 * - ADMIN: Full system access with user management capabilities
 * - MANAGER: Can manage sales and staff, requires admin approval
 * - WAREHOUSE: Can manage products and inventory
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MANAGER = 'manager',
  WAREHOUSE = 'warehouse',
}

/**
 * Approval status enum
 * Used for manager registration approval workflow
 * - APPROVED: User can log in and access their role
 * - PENDING: Waiting for admin approval (managers only)
 * - REJECTED: Registration request was rejected by admin
 */
export enum ApprovalStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

/**
 * User interface extending Mongoose Document
 * Defines the structure and type of User documents in the database
 */
export interface IUser extends Document {
  email: string; // Unique user email, used for authentication
  password: string; // Hashed password, never stored in plain text
  firstName?: string; // Optional first name
  lastName?: string; // Optional last name
  role: UserRole; // User role determining access level
  isActive: boolean; // Whether the account is active or deactivated
  approvalStatus?: ApprovalStatus; // Approval status for manager registrations
  createdAt: Date; // Auto-generated creation timestamp
  updatedAt: Date; // Auto-generated update timestamp
  comparePassword(candidatePassword: string): Promise<boolean>; // Method to verify password
}

/**
 * User schema definition
 * Configures validation rules, defaults, and database indexes
 */
const userSchema = new Schema<IUser>(
  {
    // Email field: unique identifier for authentication
    email: {
      type: String,
      required: [true, 'Email is required'], // Required field with custom error message
      unique: true, // Ensures no duplicate emails (creates unique index)
      lowercase: true, // Converts to lowercase before saving
      trim: true, // Removes whitespace from beginning and end
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'], // Email format validation
    },
    // Password field: stored as hash, excluded from queries by default
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'], // Minimum password length
      select: false, // Exclude from query results by default for security
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    approvalStatus: {
      type: String,
      enum: Object.values(ApprovalStatus),
      default: ApprovalStatus.APPROVED,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

/**
 * Pre-save middleware: Hash password before saving
 * Automatically hashes passwords using bcrypt before saving to database
 * Only hashes if password has been modified (prevents re-hashing on every save)
 */
userSchema.pre('save', async function (next) {
  // Skip hashing if password hasn't been modified (for efficiency)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt with cost factor of 12 (higher = more secure but slower)
    const salt = await bcrypt.genSalt(12);
    // Hash the password with the generated salt
    this.password = await bcrypt.hash(this.password, salt);
    // Continue with save operation
    next();
  } catch (error) {
    // Pass error to error handler
    next(error as Error);
  }
});

/**
 * Instance method: Compare candidate password with stored hash
 * Used during login to verify user credentials
 * @param candidatePassword - Plain text password to verify
 * @returns Promise<boolean> - True if password matches, false otherwise
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // Compare plain text password with hashed password using bcrypt
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Database indexes for query optimization
 * Indexes improve query performance for common access patterns
 */
// Single field index on role for role-based filtering
userSchema.index({ role: 1 });
// Single field index on approvalStatus for approval workflow queries
userSchema.index({ approvalStatus: 1 });
// Compound index for efficient queries of pending managers (common admin task)
userSchema.index({ role: 1, approvalStatus: 1 });
// Note: email already has a unique index created by the 'unique: true' option

/**
 * Export User model
 * This is the Mongoose model used throughout the application
 */
export const User = mongoose.model<IUser>('User', userSchema);
