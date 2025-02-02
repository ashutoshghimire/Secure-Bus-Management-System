const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userModel = require('../models/usersModel');

// Ensure required environment variables are set
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  console.error('Environment variables ADMIN_EMAIL and ADMIN_PASSWORD must be set.');
  process.exit(1);
}

// Establish a database connection
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Database connection established.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1); // Exit with failure code
  }
};

const setupAdminUser = async () => {
  try {
    // Check if the admin user already exists
    const existingAdmin = await userModel.findOne({ email: process.env.ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    // Hash the admin password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

    // Create a new admin user
    const adminUser = new userModel({
      name: 'Admin User', // Adjust name as necessary
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      isAdmin: true,
      passwordCreationDate: Date.now()
    });

    // Save the admin user to the database
    await adminUser.save();
    console.log('Admin user created successfully.');

  } catch (error) {
    console.error('Error setting up admin user:', error);
    process.exit(1); // Exit with failure code
  } finally {
    // Close the database connection
    // await mongoose.disconnect();
    // console.log('Database connection closed.');
  }
};

module.exports=setupAdminUser
// Execute the setup function
// connectToDatabase().then(setupAdminUser);
