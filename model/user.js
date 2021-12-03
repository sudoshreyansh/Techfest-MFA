const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    authorizedApps: {
        type: [String]
    }
});

module.exports = mongoose.model("User", userSchema);
