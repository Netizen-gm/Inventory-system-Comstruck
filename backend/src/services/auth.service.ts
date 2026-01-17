import { User, IUser, UserRole, ApprovalStatus } from '../models/User.model';
import { Token, IToken, TokenType } from '../models/Token.model';
import { AppError } from '../utils/AppError';
import { signToken, JWTPayload } from '../utils/jwt.utils';
import { HTTP_STATUS, JWT_CONFIG } from '../utils/constants';
import mongoose from 'mongoose';

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: Omit<IUser, 'password'>;
  tokens: AuthTokens;
}

export interface LoginResponse {
  user: Omit<IUser, 'password'>;
  tokens: AuthTokens;
}

/**
 * Generate access and refresh tokens
 */
const generateTokens = (user: IUser): AuthTokens => {
  const payload: JWTPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  // Access token - shorter expiration (15 minutes)
  const accessToken = signToken(payload, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });

  // Refresh token - longer expiration (7 days)
  const refreshToken = signToken(payload, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Store refresh token in database
 */
const storeRefreshToken = async (
  userId: mongoose.Types.ObjectId,
  refreshToken: string
): Promise<IToken> => {
  // Calculate expiration date (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Store refresh token
  return Token.create({
    token: refreshToken,
    userId,
    type: TokenType.REFRESH,
    expiresAt,
  });
};

/**
 * Register a new user
 */
export const register = async (input: RegisterInput): Promise<RegisterResponse> => {
  const { email, password, firstName, lastName, role = UserRole.USER } = input;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw AppError.conflict('User with this email already exists');
  }

  // If registering as manager, set approval status to pending
  // Only admins can directly create approved managers
  const approvalStatus = role === UserRole.MANAGER 
    ? ApprovalStatus.PENDING 
    : ApprovalStatus.APPROVED;

  // Create new user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    role,
    approvalStatus,
  });

  // Generate tokens
  const tokens = generateTokens(user);

  // Store refresh token
  await storeRefreshToken(user._id, tokens.refreshToken);

  // Return user (without password) and tokens
  const userObject = user.toObject();
  delete userObject.password;

  return {
    user: userObject,
    tokens,
  };
};

/**
 * Login user
 */
export const login = async (input: LoginInput): Promise<LoginResponse> => {
  const { email, password } = input;

  // Find user and include password (using select('+password'))
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw AppError.unauthorized('Account is deactivated');
  }

  // Check approval status for managers
  if (user.role === UserRole.MANAGER) {
    if (user.approvalStatus === ApprovalStatus.PENDING) {
      throw AppError.unauthorized('Your manager account is pending approval. Please wait for admin approval.');
    }
    if (user.approvalStatus === ApprovalStatus.REJECTED) {
      throw AppError.unauthorized('Your manager account request has been rejected. Please contact an administrator.');
    }
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  // Generate tokens
  const tokens = generateTokens(user);

  // Store refresh token (with rotation - delete old tokens for this user)
  await Token.deleteMany({
    userId: user._id,
    type: TokenType.REFRESH,
  });
  await storeRefreshToken(user._id, tokens.refreshToken);

  // Return user (without password) and tokens
  const userObject = user.toObject();
  delete userObject.password;

  return {
    user: userObject,
    tokens,
  };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string }> => {
  // Verify refresh token
  const { verifyToken } = await import('../utils/jwt.utils');
  let decoded: JWTPayload;

  try {
    decoded = verifyToken(refreshToken);
  } catch (error) {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  // Check if refresh token exists in database
  const storedToken = await Token.findOne({
    token: refreshToken,
    type: TokenType.REFRESH,
    userId: new mongoose.Types.ObjectId(decoded.id),
  });

  if (!storedToken) {
    throw AppError.unauthorized('Refresh token not found');
  }

  // Check if token is expired
  if (storedToken.expiresAt < new Date()) {
    await Token.deleteOne({ _id: storedToken._id });
    throw AppError.unauthorized('Refresh token has expired');
  }

  // Check if user still exists and is active
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw AppError.unauthorized('User not found or account is deactivated');
  }

  // Generate new access token
  const payload: JWTPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = signToken(payload, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });

  return {
    accessToken,
  };
};

/**
 * Logout user (blacklist tokens)
 */
export const logout = async (
  accessToken: string,
  refreshToken: string
): Promise<void> => {
  // Verify tokens to get expiration dates
  const { verifyToken, decodeToken } = await import('../utils/jwt.utils');

  // Blacklist access token
  // Use jwt.decode to get full token including exp claim
  const decodedAccess = decodeToken(accessToken);
  if (decodedAccess) {
    const userId = decodedAccess.id;
    // jwt.decode returns the full decoded token with standard claims
    const decodedWithClaims = decodedAccess as JWTPayload & { exp?: number };
    
    if (decodedWithClaims.exp) {
      const accessTokenExpiresAt = new Date(decodedWithClaims.exp * 1000);
      // Only blacklist if token hasn't expired yet
      if (accessTokenExpiresAt > new Date()) {
        await Token.create({
          token: accessToken,
          type: TokenType.BLACKLIST,
          userId: new mongoose.Types.ObjectId(userId),
          expiresAt: accessTokenExpiresAt,
        });
      }
    }
  }

  // Delete refresh token from database
  await Token.deleteOne({
    token: refreshToken,
    type: TokenType.REFRESH,
  });
};

/**
 * Check if token is blacklisted
 */
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const blacklistedToken = await Token.findOne({
    token,
    type: TokenType.BLACKLIST,
  });

  return !!blacklistedToken;
};

/**
 * Logout from all devices (delete all refresh tokens for user)
 */
export const logoutAllDevices = async (userId: string): Promise<void> => {
  await Token.deleteMany({
    userId: new mongoose.Types.ObjectId(userId),
    type: TokenType.REFRESH,
  });
};
