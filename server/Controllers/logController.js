const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../middlewares/user-activity.log');



const clearLogs = async (req, res) => {
    try {
      fs.truncate(logFilePath, 0, (err) => {
        if (err) {
          console.error('Failed to clear logs:', err);
          return res.status(500).json({
            message: "Failed to clear logs.",
            success: false,
          });
        }
        res.json({
          message: "Logs cleared successfully.",
          success: true,
        });
      });
    } catch (error) {
      console.error('Error in clearing logs:', error);
      res.status(500).json({
        message: "Error in clearing logs.",
        success: false,
      });
    }
  };

  module.exports = clearLogs;