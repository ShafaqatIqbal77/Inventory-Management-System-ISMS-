const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const StockLog = require('../models/StockLog');

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

const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({}).sort({ createdAt: -1 });
    return res.json(invoices.map((invoice) => toFrontendShape(invoice)));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid invoice ID.' });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    return res.json(toFrontendShape(invoice));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

const createInvoice = async (req, res) => {
  try {
    const { customerId, discountPercent = 0, taxPercent = 0, items } = req.body || {};

    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'A valid customer is required.' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Add at least one product.' });
    }

    const normalizedItems = [];
    const quantityByProduct = new Map();
    let subtotal = 0;

    for (const entry of items) {
      const productId = entry?.productId;
      const quantity = Number(entry?.quantity);
      const unitPrice = Number(entry?.price);

      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Each invoice item must include a valid product.' });
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Each product quantity must be greater than zero.' });
      }

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return res.status(400).json({ message: 'Each product price must be a valid non-negative number.' });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found for item ${String(productId)}.` });
      }

      const totalQty = (quantityByProduct.get(productId) || 0) + quantity;
      quantityByProduct.set(productId, totalQty);

      if (product.quantity < totalQty) {
        return res.status(400).json({
          message: `Only ${product.quantity} units left for ${product.name}.`,
        });
      }

      normalizedItems.push({
        productId: product._id,
        name: product.name,
        quantity,
        price: unitPrice,
      });

      subtotal += quantity * unitPrice;
    }

    const discountPercentValue = Number(discountPercent) || 0;
    const taxPercentValue = Number(taxPercent) || 0;

    if (discountPercentValue < 0 || discountPercentValue > 100) {
      return res.status(400).json({ message: 'Discount percent must be between 0 and 100.' });
    }

    if (taxPercentValue < 0 || taxPercentValue > 100) {
      return res.status(400).json({ message: 'Tax percent must be between 0 and 100.' });
    }

    const discountAmount = subtotal * (discountPercentValue / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxPercentValue / 100);
    const total = taxableAmount + taxAmount;

    const invoice = await Invoice.create({
      customerId,
      customerName: customer.name,
      items: normalizedItems,
      subtotal: Number(subtotal.toFixed(2)),
      discountPercent: Number(discountPercentValue),
      taxPercent: Number(taxPercentValue),
      total: Number(total.toFixed(2)),
    });

    // Reduce stock quantities and record a sale log for each item.
    const stockUpdates = normalizedItems.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { quantity: -item.quantity } },
      },
    }));

    if (stockUpdates.length > 0) {
      await Product.bulkWrite(stockUpdates);
    }

    await StockLog.insertMany(
      normalizedItems.map((item) => ({
        product: item.productId,
        type: 'out',
        quantity: item.quantity,
        note: 'Sale invoice',
        createdBy: req.user._id,
      })),
    );

    return res.status(201).json(toFrontendShape(invoice));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ name: 1 });
    const invoices = await Invoice.find({}).sort({ createdAt: -1 });

    const totalSales = invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
    const lowStockItems = products.filter((product) => Number(product.quantity) <= Number(product.lowStockLimit || 5));

    const salesTrend = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      const monthLabel = date.toLocaleString('default', { month: 'short' });
      const monthValue = invoices
        .filter((invoice) => {
          const invoiceDate = new Date(invoice.createdAt);
          return (
            invoiceDate.getMonth() === date.getMonth() &&
            invoiceDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);

      return { label: monthLabel, sales: monthValue };
    });

    return res.json({
      totalSales,
      productCount: products.length,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.map((product) => toFrontendShape(product)),
      salesTrend,
      recentInvoices: invoices.slice(0, 5).map((invoice) => toFrontendShape(invoice)),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  getDashboardStats,
};
