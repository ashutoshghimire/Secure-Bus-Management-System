const bcrypt = require('bcryptjs');
const userModel = require('../models/usersModel'); // Adjust the path as needed
const jwt = require('jsonwebtoken');

const changePasswordController = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Extract token from Authorization header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).send({ message: 'No token provided', success: false });
        }

        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id; // Extract user ID from token

        // Find user by ID
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found", success: false });
        }

        // Check if the current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).send({ message: "Current password is incorrect", success: false });
        }

        // Flatten previousPasswords array
        const flatPreviousPasswords = user.previousPasswords.flat();

        // Check if the new password is the same as any of the previous passwords
        const isPreviousPassword = await Promise.all(
            flatPreviousPasswords.map(async (hashedPassword) => await bcrypt.compare(newPassword, hashedPassword))
        );
        if (isPreviousPassword.includes(true)) {
            return res.status(400).send({ message: "New password cannot be the same as a previous password", success: false });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update user password and previous passwords
        user.previousPasswords.push([user.password]); // Store the old password in previousPasswords
        user.password = hashedNewPassword; // Update to the new password
        user.passwordCreationDate = Date.now(); // Update the password creation date

        // Update the password expiry date to 90 days from the new password creation date
        const newExpiryDate = new Date(user.passwordCreationDate);
        newExpiryDate.setDate(newExpiryDate.getDate() + 90);
        user.passwordExpiryDate = newExpiryDate;

        await user.save();

        res.status(200).send({ message: "Password changed successfully", success: true });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: `Error in Change Password Controller: ${error.message}`, success: false });
    }
};

module.exports = changePasswordController;


