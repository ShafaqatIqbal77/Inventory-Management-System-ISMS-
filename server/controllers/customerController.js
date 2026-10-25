const mongoose = require('mongoose');
const Customer = require('../models/Customer');

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

const normalizeCustomerPayload = (payload = {}) => {
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const phone = typeof payload.phone === 'string' ? payload.phone.trim() : '';
  const address = typeof payload.address === 'string' ? payload.address.trim() : '';

  if (!name) {
    return { error: 'Customer name is required.' };
  }

  return {
    data: {
      name,
      phone,
      address,
    },
  };
};

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ name: 1 });
    return res.json(customers.map((customer) => toFrontendShape(customer)));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid customer ID.' });
    }

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    return res.json(toFrontendShape(customer));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

const createCustomer = async (req, res) => {
  try {
    const validation = normalizeCustomerPayload(req.body || {});

    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    const customer = await Customer.create(validation.data);
    return res.status(201).json(toFrontendShape(customer));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid customer ID.' });
    }

    const validation = normalizeCustomerPayload(req.body || {});

    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    const customer = await Customer.findByIdAndUpdate(id, validation.data, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    return res.json(toFrontendShape(customer));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid customer ID.' });
    }

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    return res.json({ message: 'Customer deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
