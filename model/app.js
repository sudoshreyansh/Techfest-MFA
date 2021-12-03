const mongoose = require("mongoose");

const appSchema = mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    successUrl: {
        type: String,
        required: true
    },
    failureUrl: {
        type: String,
        required: true
    },
    logoutUrl: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Application", appSchema);
