const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required.'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Product category is required.'],
      trim: true,
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative.'],
      default: 0,
    },
    quantity: {
      type: Number,
      min: [0, 'Quantity cannot be negative.'],
      default: 0,
    },
    lowStockLimit: {
      type: Number,
      min: [0, 'Low stock limit cannot be negative.'],
      default: 5,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Product', productSchema);
