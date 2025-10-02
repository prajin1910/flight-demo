require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const initializeData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://reksitrajan01:8n4SHiaJfCZRrimg@cluster0.mperr.mongodb.net/flightbooking?retryWrites=true&w=majority');
    console.log('Connected to MongoDB');

    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@flights.com' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: 'admin@flights.com',
        password: 'trilogy123',
        role: 'admin',
        isActive: true
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    // Create sample user if none exists
    const userCount = await User.countDocuments({ role: 'user' });
    if (userCount === 0) {
      await User.create({
        username: 'testuser',
        email: 'user@example.com',
        password: 'password123',
        role: 'user',
        profile: {
          firstName: 'Test',
          lastName: 'User',
          phone: '+1234567890'
        },
        isActive: true
      });
      console.log('Sample user created');
    } else {
      console.log('Users already exist');
    }

    console.log('Database initialization complete - No hardcoded flights created');
    console.log('All flights must be added through the admin panel');
    process.exit(0);

  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
};

initializeData();