const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is missing in .env');
}

const generateToken = (user) => jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '7d' });

const sanitizeUser = (user) => {
  const record = user && user.toObject ? user.toObject() : { ...(user || {}) };
  const { password, _id, __v, ...safeUser } = record;

  if (_id || record.id) {
    safeUser.id = String(_id || record.id);
  }

  return safeUser;
};

const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    return res.json({ user: sanitizeUser(req.user) });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    if (!email || !String(email).trim()) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const validRoles = ['admin', 'manager', 'salesman'];
    const selectedRole = validRoles.includes(role) ? role : 'salesman';

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: String(name).trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: selectedRole,
    });

    const token = generateToken(user);
    return res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !String(email).trim()) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    return res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
