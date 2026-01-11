import mongoose, { Document, Schema } from 'mongoose';

export interface IStaff extends Document {
  userId: mongoose.Types.ObjectId;
  employeeId: string;
  department?: string;
  position?: string;
  hireDate?: Date;
  phoneNumber?: string;
  address?: string;
  salary?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    hireDate: {
      type: Date,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    salary: {
      type: Number,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and filtering
// Note: employeeId and userId already have indexes from unique: true
staffSchema.index({ department: 1 });
staffSchema.index({ position: 1 });
staffSchema.index({ isActive: 1 });
staffSchema.index({ userId: 1, isActive: 1 });

export const Staff = mongoose.model<IStaff>('Staff', staffSchema);
