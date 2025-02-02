const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;
const connectDB = require("./config/dbConfig");
const bodyParser = require("body-parser");
const setupAdminUser = require("./config/setupAdmin")
const authMiddleware = require("./middlewares/authMiddleware")
const logUserActivity = require("./middlewares/logger")
const rateLimit = require("express-rate-limit");


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
// Enable trust proxy
app.set('trust proxy', 1); 
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  headers: true, // Send rate limit info in headers
});
app.use(limiter);
connectDB()
setupAdminUser();
app.use("/api/auth", require("./routes/authRoutes"));
app.use(authMiddleware);
app.use(logUserActivity);

app.use("/api/users", require("./routes/usersRoutes"));
app.use("/api/buses", require("./routes/busesRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/bookings", require("./routes/bookingsRoutes"));
app.use("/api/cities", require("./routes/citiesRoutes"));
app.use("/api/change", require("./routes/changePassRoute"));
app.use("/api/stripe", require("./routes/stripe")); 
// listen to port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
