const mongoose = require("mongoose");

const appSchema = mongoose.Schema({
  appId: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  publicKey: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Application", appSchema);
