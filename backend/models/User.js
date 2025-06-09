const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true }, // <-- Added email field
  password: {
    type: String,
    required: function () {
      // If not signing in with Google, password is required.
      return !this.googleId;
    },
  },
  googleId: { type: String }, // for Google sign-in, if applicable
});

module.exports = mongoose.model("User", UserSchema);
