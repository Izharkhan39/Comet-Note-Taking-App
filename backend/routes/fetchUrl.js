// backend/routes/fetchUrl.js
const express = require("express");
const { getLinkPreview } = require("link-preview-js");
const router = express.Router();

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

router.get("/", async (req, res) => {
  try {
    let url = req.query.url;

    console.log("Received URL:", url); // ✅ Log received URL

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Decode the URL in case it's double-encoded
    url = decodeURIComponent(url);
    console.log("Decoded URL:", url); // ✅ Log decoded URL

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: "Invalid URL provided" });
    }

    const previewData = await getLinkPreview(url);

    const image =
      Array.isArray(previewData.images) && previewData.images.length > 0
        ? previewData.images[0]
        : "";

    res.json({
      link: url,
      meta: {
        title: previewData.title || "",
        description: previewData.description || "",
        image: image,
        url: previewData.url || url,
      },
    });
  } catch (error) {
    console.error("Error fetching link preview:", error);
    res.status(500).json({ error: "Failed to fetch link preview" });
  }
});

module.exports = router;
