const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose'); // Make sure to have mongoose for database connection
const User = require('../models/usersModel'); // Adjust the path as needed
const logFilePath = path.join(__dirname, 'user-activity.log');
const authMiddleware=require("./authMiddleware");


const logUserActivity = async (req, res, next) => {
  try {
    // Extract relevant details
    
    const userId = req.body.userId 
    const username =  await getUsernameById(userId);

    // Create log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      userId: userId,
      username: username,
      body: req.body,
    };

    // Write log entry to the file
    fs.appendFile(logFilePath, JSON.stringify(logEntry) + '\n', (err) => {
      if (err) {
        console.error('Failed to log user activity:', err);
      }
    });

    next();
  } catch (error) {
    console.error('Error in logging user activity:', error);
    next(); // Ensure to call next() even if there's an error
  }
};

// Function to fetch username by user ID
const getUsernameById = async (userId) => {
  try {
    const user = await User.findById(userId).select('name'); // Adjust field as necessary
    return user ? user.name : 'Unknown User';
  } catch (error) {
    console.error('Error fetching username:', error);
    return 'Error Fetching Username';
  }
};

module.exports = logUserActivity;
