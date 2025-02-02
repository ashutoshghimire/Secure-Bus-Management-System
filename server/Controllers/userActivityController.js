const fs = require('fs');
const path = require('path');

// Define the path to the log file
const logFilePath = path.join(__dirname, '../middlewares/', 'user-activity.log');

// Controller to get user activity logs
const getUserActivityLogs = (req, res) => {
  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read log file:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // Split the log data into lines
    const lines = data.trim().split('\n');
    const logs = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (parseErr) {
        console.error('Failed to parse log entry:', parseErr);
        return null;
      }
    }).filter(log => log !== null); // Remove any null entries

    res.json(logs);
  });
};

module.exports = getUserActivityLogs;

