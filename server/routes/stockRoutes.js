const express = require('express');
const mongoose = require('mongoose');
const { protect, allowRoles } = require('../middleware/auth');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const StockLog = require('../models/StockLog');

const router = express.Router();

// Flatten Mongoose documents to the same id-based JSON shape the frontend expects.
const toFrontendShape = (value) => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value && typeof value.toHexString === 'function') {
    return value.toHexString();
  }

  if (typeof value?.toJSON === 'function' && value?.constructor?.name !== 'Object') {
    const json = value.toJSON();
    if (typeof json !== 'object' || json === null) {
      return json;
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => toFrontendShape(item));
  }

  if (value && typeof value === 'object') {
    const plain = value.toObject ? value.toObject() : value;
    const { _id, __v, ...rest } = plain;
    const normalized = {};

    Object.entries(rest).forEach(([key, item]) => {
      normalized[key] = toFrontendShape(item);
    });

    if (_id || plain.id) {
      normalized.id = String(_id || plain.id);
    }

    return normalized;
  }

  return value;
};

const parseQuantity = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
};

router.use(protect);

router.post('/in', allowRoles('admin', 'manager'), async (req, res) => {
  try {
    const { supplier, product, quantity, date, note } = req.body || {};
    const parsedQuantity = parseQuantity(quantity);

    if (!supplier || !mongoose.Types.ObjectId.isValid(supplier)) {
      return res.status(400).json({ message: 'A valid supplier is required.' });
    }

    if (!product || !mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({ message: 'A valid product is required.' });
    }

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than zero.' });
    }

    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }

    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      product,
      { $inc: { quantity: parsedQuantity } },
      { new: true, runValidators: true },
    );

    const stockLog = await StockLog.create({
      product,
      type: 'in',
      quantity: parsedQuantity,
      supplier,
      note: note || 'Stock received',
      date: date ? new Date(date) : undefined,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      product: toFrontendShape(updatedProduct),
      stockLog: toFrontendShape(stockLog),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

router.get('/logs', allowRoles('admin', 'manager'), async (req, res) => {
  try {
    const { product } = req.query || {};
    const filter = {};

    if (product && mongoose.Types.ObjectId.isValid(product)) {
      filter.product = product;
    }

    const logs = await StockLog.find(filter)
      .populate('product', 'name category')
      .populate('supplier', 'name')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    return res.json(logs.map((log) => toFrontendShape(log)));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;
