"use strict";

// import base modules
const request = require("request");
const cottage = require("cottage");
const bodyParser = require('koa-bodyparser');
const serve = require("koa-static");

const fs = require("fs");
const path = require("path");

let appDir = path.dirname(require.main.filename);
let setting = require("./setting.json");

// using bodyparser and static serving
const app = cottage();
app.use(bodyParser());
app.use(serve("."));

/**
 * Get User's Real username. It needs for when logging mentions.
 *
 * @param token         Slack Token
 * @param userId        User's unique ID in slack.
 * @returns {Promise}   Promise of Response. (for Generator)
 */
function getUserName (token, userId) {
    let url = `https://slack.com/api/users.info?token=${token}&user=${userId}`;
    return new Promise(function (fulfill, reject) {
        request.get(url, { json: true }, function (err, res, body) {
            if (err) reject(err);
            else fulfill(body.user.name);
        });
    });
}

function formatText (str, len) {
    function string (str, len) {
        var s = '', i = 0;
        while (i++ < len) s += str;
        return s;
    }

    return string("0", len - str.length) + str;
}

function writeToFile (path, data) {
    fs.exists(path, function (exists) {
        if (exists) fs.appendFile(path, data, 'UTF-8', function (err) {
            if (err) return console.log(err);
        });

        else fs.writeFile(path, data, 'UTF-8', function (err) {
            if (err) return console.log(err);
        });
    });
}

// HTTP POST /logger
// Register this link for Slack Outgoing Webhook.
app.post("/logger", function *(req) {
    let userName = req.body.user_name;
    let text = req.body.text;
    let channelName = req.body.channel_name;
    let timestamp = req.body.timestamp;

    let date = new Date(timestamp * 1000)
    let formatDate = `${d.getFullYear()}${formatText(String(d.getMonth() + 1), 2)}${formatText(String(d.getDate()), 2)}`

    let regexp = text.match(/<@(U[A-Z0-9]{8})>/g);
    let userIds = (regexp != undefined)? regexp.map(obj => 
            obj.replaceAll("<", "").replaceAll(">", "").replaceAll("@", "")): [];

    var data = `[${formatDate}] ${userName}: ${text}\r\n`;
    var userNames = {};
    for (let userId of userIds)
        userNames[userId] = yield getUserName(setting.token, userId);

    for (let userName in userNames)
        if (userNames.hasOwnProperty(userName))
            data = data.replaceAll(userName, userNames[userName]);

    writeToFile(`${appDir}/logs/${channelName}.log`, data);
});

app.listen(4000);