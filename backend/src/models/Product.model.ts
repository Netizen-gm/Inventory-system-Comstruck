import mongoose, { Document, Schema } from 'mongoose';

export enum ProductStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

export interface IProduct extends Document {
  name: string;
  description?: string;
  category: string;
  sku: string;
  quantity: number;
  minStock: number;
  maxStock?: number;
  unit: string;
  pricePerUnit: number;
  status: ProductStatus;
  location?: string;
  supplier?: string;
  lastRestocked?: Date;
  createdAt: Date;
  updatedAt: Date;
  updateStockStatus(): void;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    minStock: {
      type: Number,
      required: [true, 'Minimum stock level is required'],
      min: [0, 'Minimum stock cannot be negative'],
      default: 0,
    },
    maxStock: {
      type: Number,
      min: [0, 'Maximum stock cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
      default: 'bag',
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative'],
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.OUT_OF_STOCK,
      index: true,
    },
    location: {
      type: String,
      trim: true,
    },
    supplier: {
      type: String,
      trim: true,
    },
    lastRestocked: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and filtering
productSchema.index({ category: 1, status: 1 });
productSchema.index({ quantity: 1 });
productSchema.index({ status: 1, quantity: 1 });

// Instance method to update stock status based on quantity
productSchema.methods.updateStockStatus = function (): void {
  if (this.quantity <= 0) {
    this.status = ProductStatus.OUT_OF_STOCK;
  } else if (this.quantity <= this.minStock) {
    this.status = ProductStatus.LOW_STOCK;
  } else {
    this.status = ProductStatus.IN_STOCK;
  }
};

// Pre-save hook to auto-update stock status
productSchema.pre('save', function (next) {
  // Only update status if quantity changed
  if (this.isModified('quantity') || this.isModified('minStock')) {
    this.updateStockStatus();
  }
  next();
});

// Pre-save hook to prevent negative stock
productSchema.pre('save', function (next) {
  if (this.quantity < 0) {
    next(new Error('Quantity cannot be negative'));
  } else {
    next();
  }
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
