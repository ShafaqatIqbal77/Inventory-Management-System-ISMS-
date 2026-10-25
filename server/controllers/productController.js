const mongoose = require('mongoose');
const Product = require('../models/Product');

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

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const validateProductPayload = (payload = {}) => {
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const category = typeof payload.category === 'string' ? payload.category.trim() : '';
  const price = Number(payload.price);
  const quantity = Number(payload.quantity ?? 0);
  const lowStockLimit = Number(payload.lowStockLimit ?? 5);

  if (!name) {
    return { error: 'Product name is required.' };
  }

  if (!category) {
    return { error: 'Product category is required.' };
  }

  if (Number.isNaN(price) || price < 0) {
    return { error: 'Product price must be a number greater than or equal to zero.' };
  }

  if (Number.isNaN(quantity) || quantity < 0) {
    return { error: 'Product quantity must be a number greater than or equal to zero.' };
  }

  if (Number.isNaN(lowStockLimit) || lowStockLimit < 0) {
    return { error: 'Low stock limit must be a number greater than or equal to zero.' };
  }

  return {
    data: {
      name,
      category,
      price,
      quantity,
      lowStockLimit,
    },
  };
};

const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search && String(search).trim()) {
      const keyword = escapeRegex(String(search).trim());
      filter.$or = [
        { name: new RegExp(keyword, 'i') },
        { category: new RegExp(keyword, 'i') },
      ];
    }

    if (category && String(category).trim()) {
      const categoryValue = escapeRegex(String(category).trim());
      filter.category = new RegExp(`^${categoryValue}$`, 'i');
    }

    const products = await Product.find(filter).sort({ name: 1 });
    return res.json(products.map((product) => toFrontendShape(product)));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json(toFrontendShape(product));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

const createProduct = async (req, res) => {
  try {
    const validation = validateProductPayload(req.body || {});

    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    const product = await Product.create(validation.data);
    return res.status(201).json(toFrontendShape(product));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    const validation = validateProductPayload(req.body || {});

    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    const product = await Product.findByIdAndUpdate(id, validation.data, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json(toFrontendShape(product));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
