import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/userModel.js';

await mongoose.connect(process.env.MONGO_URI);
const existing = await User.findOne({ email: 'admin@example.com' });

if (!existing) {
  const newAdmin = new User({
    username: 'Admin',
    email: 'admin@example.com',
    password: 'SecureAdminPass123!',
    role: 'admin'
  });

  await newAdmin.save();
  console.log('✅ Admin user seeded');
} else {
  console.log('⚠️ Admin already exists');
}

mongoose.disconnect();

//Admin Seeding Script(Create Default Admin User)
//This ensures your app has at least one admin account during setup
// RUN With [Bash]: node scripts/seedAdmin.js