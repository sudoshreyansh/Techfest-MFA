const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  userId: {
    type: Number,
    required: true
  },
  authStat: {
    type: Array,
    default: []
  }
});

module.exports = mongoose.model("User", userSchema);
