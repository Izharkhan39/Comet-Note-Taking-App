require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const passport = require("passport");
const path = require("path");

// Create the Express app before using it
const app = express();

// Load Passport strategies
require("./auth/googleStrategy");

const User = require("./models/User"); // Ensure you require your User model

// Set up express-session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "Izharkhan@244",
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport and session support
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

const authenticateToken = require("./middleware/authenticateToken");

// Import routes
const authRoutes = require("./routes/auth");
const noteRoutes = require("./routes/notes");
const uploadRoutes = require("./routes/upload"); // New upload route
const fetchUrlRoutes = require("./routes/fetchUrl"); // New fetchUrl route
const taskRoutes = require("./routes/tasks"); // Import the tasks route

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define API routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/uploadFile", uploadRoutes); // Register the upload endpoint
app.use("/fetchUrl", fetchUrlRoutes); // Register the fetchUrl endpoint
app.use("/api/tasks", taskRoutes); // Register the tasks API route

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Get logged-in user details
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ username: user.username, email: user.email }); // Include email
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
