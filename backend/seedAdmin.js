require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');

const ADMIN_EMAIL    = 'jigar123@gmail.com';
const ADMIN_PASSWORD = 'jigar@123';

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected.');

    const exists = await User.findOne({ email: ADMIN_EMAIL });
    if (exists) {
      console.log('Admin already exists. Skipping.');
      process.exit(0);
    }

    await User.create({ name: 'Jigar', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });

    console.log('Admin created successfully.');
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
