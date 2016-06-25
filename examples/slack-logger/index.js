"use strict";

// import base modules
let co = require("co");
let request = require("request");
let cottage = require("cottage");
let bodyParser = require('koa-bodyparser');
let serve = require("koa-static");

let fs = require("fs");
let path = require("path");
let appDir = path.dirname(require.main.filename);

let setting = require("./setting.json");

// using bodyparser and static serving
let app = cottage();
app.use(bodyParser());
app.use(serve("."));

/**
 * Formatting Date with simple string
 *
 * @param f         format string
 * @returns {*}     formatted date string
 */
Date.prototype.format = function (f) {
    if (!this.valueOf()) return " ";
    var d = this, h;
    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            default: return $1;
        }
    });
};

String.prototype.string = function (len) {
    var s = '', i = 0;
    while (i++ < len) s += this;
    return s;
};

String.prototype.zf = function (len) {
    return "0".string(len - this.length) + this;
};

String.prototype.replaceAll = function (target, replacement) {
    return this.split(target).join(replacement);
};

Number.prototype.zf = function (len) {
    return this.toString().zf(len);
};

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

function getFilePath (channelName) {
    return `${appDir}/logs/${channelName}.log`;
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
    console.log(req.body);

    let userName = req.body.user_name;
    let text = req.body.text;
    let channelName = req.body.channel_name;
    let timestamp = req.body.timestamp;

    let formatDate = new Date(timestamp * 1000).format("yyyyMMdd HH:mm:ss");

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

    const path = getFilePath(channelName, appDir);
    writeToFile(path, data);
});

// you can use whole request mapping.
app.all(function *(req) {
    return 404;
});

app.listen(4000);
