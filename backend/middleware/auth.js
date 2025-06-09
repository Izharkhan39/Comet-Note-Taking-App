// backend/middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract Bearer token

  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attach user to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
