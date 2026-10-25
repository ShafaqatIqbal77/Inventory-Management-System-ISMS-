const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required.'],
    },
    name: {
      type: String,
      required: [true, 'Product name is required.'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required.'],
      min: [1, 'Quantity must be greater than zero.'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required.'],
      min: [0, 'Price cannot be negative.'],
    },
  },
  { _id: false },
);

const invoiceSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required.'],
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required.'],
      trim: true,
    },
    items: [invoiceItemSchema],
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required.'],
      min: [0, 'Subtotal cannot be negative.'],
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative.'],
      max: [100, 'Discount cannot exceed 100%.'],
    },
    taxPercent: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative.'],
      max: [100, 'Tax cannot exceed 100%.'],
    },
    total: {
      type: Number,
      required: [true, 'Total is required.'],
      min: [0, 'Total cannot be negative.'],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Invoice', invoiceSchema);
