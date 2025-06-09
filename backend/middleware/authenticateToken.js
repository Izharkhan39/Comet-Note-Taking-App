const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1]; // Extract token

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token is not valid" });
    req.user = user; // This will include id and username if token was signed properly
    next();
  });
}

module.exports = authenticateToken;
