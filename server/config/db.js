const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

const seedDefaultUsers = async () => {
  const demoUsers = [
    { name: 'System Admin', email: 'admin@ipms.com', password: 'admin123', role: 'admin' },
    { name: 'Store Manager', email: 'manager@ipms.com', password: 'manager123', role: 'manager' },
    { name: 'Sales Agent', email: 'salesman@ipms.com', password: 'sales123', role: 'salesman' },
  ];

  for (const user of demoUsers) {
    const existing = await User.findOne({ email: user.email.toLowerCase() });

    if (!existing) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({
        name: user.name,
        email: user.email.toLowerCase(),
        password: hashedPassword,
        role: user.role,
      });
    }
  }
};

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error('MONGO_URI is missing in .env');
      process.exit(1);
    }

    const connection = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${connection.connection.host}`);
    await seedDefaultUsers();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
