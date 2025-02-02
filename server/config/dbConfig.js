const mongoose = require("mongoose");
const colors = require("colors");


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`Mongodb connected ${mongoose.connection.host}`.bgGreen.white);

  } catch (error) {
    console.log(`Mongodb Server Issue ${error}`.bgRed.white);
  }
};

// mongoose.connect("mongodb://127.0.0.1:27017/bus-booking", );

// const db = mongoose.connection;

// db.on("connected", () => {
//   console.log("Mongo Db Connection Successful");
// });

// db.on("error", () => {
//   console.log("Mongo Db Connection Failed");
// });

const setupAdminUser = async () => {
  try {
    // Check if the admin user already exists
    const existingAdmin = await userModel.findOne({ email: process.env.ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      await mongoose.disconnect();
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
    });

    // Save the admin user to the database
    await adminUser.save();
    console.log('Admin user created successfully.');

    // Close the database connection
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error setting up admin user:', error);
    process.exit(1); // Exit with failure code
  }
};

module.exports = connectDB;