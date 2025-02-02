import axios from "axios";
import { Navigate } from "react-router-dom"
import { message } from "antd";

/**
 * Function to check password expiry and navigate if expired.
 */
const checkPasswordExpiry = async () => {
  
  try {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id")
    if (!token) {
      // If no token, navigate to login
      <Navigate to="/login" />;
      return;
    }

    const res = await axios.get(
      `/api/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.data.success) {
      const { passwordExpiryDate } = res.data.data;
      const expiryDate = new Date(passwordExpiryDate);
      const currentDate = new Date();

      if (expiryDate <= currentDate) {
        // Password is expired, navigate to change-password
        message.error("Password expired, please change your password.");
        <Navigate to="/change-password" />;
      }
    } else {
      // Handle unsuccessful response
      localStorage.clear();
      <Navigate to="/login" />;
    }
  } catch (error) {
    // Handle error
    console.error(error);
    localStorage.clear();
    <Navigate to="/login" />;
  }
};

export default checkPasswordExpiry;
