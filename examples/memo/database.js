"use strict";

// import modules and setting
let setting = require("./setting.json")
let mongoose = require("mongoose");

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
