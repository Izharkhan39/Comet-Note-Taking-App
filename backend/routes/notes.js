// backend/routes/notes.js
const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const authenticateToken = require("../middleware/authenticateToken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Prepend Date.now() to avoid naming conflicts
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// GET: Fetch all notes for the authenticated user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const notes = await Note.find({ owner: req.user.id });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Create a new note for the authenticated user
// Use multer middleware to optionally handle an image file in the "image" field
router.post(
  "/",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      // Create a new note object
      const noteData = {
        owner: req.user.id,
        data: req.body.data, // Editor.js JSON data
        category: req.body.category || "private", // Use provided category or default to "private"
      };

      // If an image file was uploaded, set the imageUrl field
      if (req.file) {
        noteData.imageUrl = `/uploads/${req.file.filename}`;
      }

      const note = new Note(noteData);
      await note.save();
      res.json(note);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// PUT: Update an existing note
// Also supports an optional image update via file upload
router.put(
  "/:id",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      // Build the update object
      const updateData = {
        data: req.body.data,
        category: req.body.category || "private",
      };

      // If a new image file is uploaded, update imageUrl
      if (req.file) {
        updateData.imageUrl = `/uploads/${req.file.filename}`;
      }

      const note = await Note.findOneAndUpdate(
        { _id: req.params.id, owner: req.user.id },
        updateData,
        { new: true }
      );
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE: Delete a note from the database
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    // Only delete the note if it belongs to the authenticated user
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static files from the uploads directory
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

module.exports = router;

router.get("/", async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});
