import mongoose, { Document, Schema } from 'mongoose';

export enum TokenType {
  REFRESH = 'refresh',
  BLACKLIST = 'blacklist',
}

export interface IToken extends Document {
  token: string;
  userId: mongoose.Types.ObjectId;
  type: TokenType;
  expiresAt: Date;
  createdAt: Date;
}

const tokenSchema = new Schema<IToken>(
  {
    token: {
      type: String,
      required: [true, 'Token is required'],
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TokenType),
      required: [true, 'Token type is required'],
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      index: { expireAfterSeconds: 0 }, // TTL index for automatic deletion
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
tokenSchema.index({ userId: 1, type: 1 });
tokenSchema.index({ token: 1, type: 1 });

// Static method to check if token is blacklisted
tokenSchema.statics.isBlacklisted = async function (token: string): Promise<boolean> {
  const blacklistedToken = await this.findOne({
    token,
    type: TokenType.BLACKLIST,
  });
  return !!blacklistedToken;
};

// Static method to blacklist a token
tokenSchema.statics.blacklistToken = async function (
  token: string,
  expiresAt: Date
): Promise<IToken> {
  return this.create({
    token,
    type: TokenType.BLACKLIST,
    expiresAt,
  });
};

// Static method to clean expired tokens (optional cleanup)
tokenSchema.statics.cleanExpiredTokens = async function (): Promise<number> {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
  return result.deletedCount || 0;
};

export const Token = mongoose.model<IToken>('Token', tokenSchema);
