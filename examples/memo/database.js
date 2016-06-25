"use strict";

// import modules and setting
const setting = require("./setting.json")
const mongoose = require("mongoose");

// define database model
let Memo = mongoose.model("Memo", {
    title: String,
    data: String,
    createdAt: {
        type: Date,
        default: new Date()
    }
});

// connect and export
mongoose.connect(setting.mongo);
module.exports = mongoose;
