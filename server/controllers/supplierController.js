const mongoose = require('mongoose');
const Supplier = require('../models/Supplier');

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

const normalizeSupplierPayload = (payload = {}) => {
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const phone = typeof payload.phone === 'string' ? payload.phone.trim() : '';
  const address = typeof payload.address === 'string' ? payload.address.trim() : '';

  if (!name) {
    return { error: 'Supplier name is required.' };
  }

  return {
    data: {
      name,
      phone,
      address,
    },
  };
};

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({}).sort({ name: 1 });
    return res.json(suppliers.map((supplier) => toFrontendShape(supplier)));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid supplier ID.' });
    }

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }

    return res.json(toFrontendShape(supplier));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

const createSupplier = async (req, res) => {
  try {
    const validation = normalizeSupplierPayload(req.body || {});

    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    const supplier = await Supplier.create(validation.data);
    return res.status(201).json(toFrontendShape(supplier));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid supplier ID.' });
    }

    const validation = normalizeSupplierPayload(req.body || {});

    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    const supplier = await Supplier.findByIdAndUpdate(id, validation.data, {
      new: true,
      runValidators: true,
    });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }

    return res.json(toFrontendShape(supplier));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid supplier ID.' });
    }

    const supplier = await Supplier.findByIdAndDelete(id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }

    return res.json({ message: 'Supplier deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
