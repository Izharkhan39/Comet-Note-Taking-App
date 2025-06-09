// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");
const Note = require("../models/Note"); // 1. Import the Note model

// Registration Endpoint
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body; // Read email from request
    // Check if the user exists by username or email
    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash the password and create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, email, password: hashedPassword }); // Use 'password' field as per your model/login
    await user.save(); // User is now saved and has an _id

    // --- 2. Create the Default Welcome Note ---
    // Ensure this structure matches your Note model schema in 'backend/models/Note.js'
    const defaultNote = {
      userId: user._id, // Use the ID of the newly created user
      category: "private", // Or your desired default category
      // If your Note schema requires a 'title', add it here:
      // title: 'Welcome Note',
      data: {
        blocks: [
          {
            type: "header",
            data: { text: "Welcome to Your Notes!", level: 1 },
          },
          {
            type: "paragraph",
            data: {
              text: "This is your very first note. Here are some things you can do:",
            },
          },
          {
            type: "list",
            data: {
              style: "unordered",
              items: [
                "🖊️ Create and format rich text pages",
                "📷 Upload or embed images and files",
                "🔗 Insert links, quotes, code snippets",
                "📊 Build tables, toggle blocks, color‑pickers",
                "🗂️ Organize pages into categories",
                "↪️ Drag & drop blocks, undo/redo changes",
                "🔒 Everything is auto‑saved and private to you",
              ],
            },
          },
          {
            type: "paragraph",
            data: {
              text: "Feel free to delete this note when you’re ready, or edit it to explore the editor!",
            },
          },
        ],
      },
    };

    await Note.create(defaultNote); // Attempt to save the default note
    // --- End of Default Note Creation ---

    // Original success response
    res.json({ message: "User registered successfully" });
  } catch (err) {
    // Original error handling
    // Note: If Note.create fails, this catch block will handle it.
    // Check server logs for Mongoose validation errors if registration fails.
    res.status(500).json({ error: err.message });
  }
});

// REMOVED the duplicate '/api/auth/register' pseudocode route.

// Login Endpoint (Unchanged from your provided code)
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body; // 'identifier' is either username or email
    // Find a user by username or email
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Compare the entered password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate a JWT token including user id and username
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google OAuth Route: Initiate authentication (Unchanged from your provided code)
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback Route (Unchanged from your provided code)
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login.html" }),
  (req, res) => {
    // Successful authentication: generate a JWT token for the user
    const token = jwt.sign(
      { id: req.user._id, username: req.user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    // Redirect to main page with token as a query parameter
    res.redirect(`http://localhost:5173/index.html?token=${token}`);
  }
);

module.exports = router; // Unchanged
