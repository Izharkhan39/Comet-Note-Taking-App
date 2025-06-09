const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configure Multer storage to save files in the backend/uploads folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads")); // Adjust the path accordingly
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Generate a unique filename
  },
});

const upload = multer({ storage });

// POST: Handle file upload (supports both images and attachments)
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  (req, res) => {
    // Check for an uploaded file in either "image" or "file" field
    let uploadedFile = null;
    if (req.files["image"]) {
      uploadedFile = req.files["image"][0];
    } else if (req.files["file"]) {
      uploadedFile = req.files["file"][0];
    }

    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Extract file extension (without the dot)
    const extension = path
      .extname(uploadedFile.originalname)
      .toLowerCase()
      .substring(1);

    // Return a JSON response with the file URL and details,
    // using "title" for the file name as expected by Attaches Tool,
    // and "extension" to help it display the correct icon.
    res.json({
      success: 1,
      file: {
        url: `http://localhost:5002/uploads/${uploadedFile.filename}`,
        title: uploadedFile.originalname,
        size: uploadedFile.size,
        extension: extension, // e.g., "pdf", "docx", etc.
      },
    });
  }
);

module.exports = router;
