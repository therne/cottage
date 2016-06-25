"use strict";

// import base modules
const cottage = require("cottage");
const bodyParser = require('koa-bodyparser');
const setting = require("./setting.json");
const database = require("./database.js");

let Memo = database.model("Memo");
let ObjectId = database.Types.ObjectId;

// using bodyparser and static serving
let app = cottage({ caseSensitive: true });
app.use(bodyParser());

function findProperties (array, object) {
    var returnVal = true;
    for (let val of array) if (!object.hasOwnProperty(val)) returnVal = false;
    return returnVal;
}

function checkNullOrUndefined (obj) {
    return (obj === undefined || obj === null);
}

app.get("/memo", function *(req, res) {
    // Check validation
    if (!findProperties(["length", "pageNo"], req.body)) {
        res.status = 412;
        return;
    }

    let length = parseInt(req.body.length);
    let offset = (parseInt(req.body.pageNo) - 1) * length;
    return yield Memo.find({}, null, { skip: offset, limit: length });
});

app.get("/memo/:memoId", function *(req, res) {
    return yield Memo.findById(ObjectId(req.params.memoId));
});

app.post("/memo", function *(req, res) {
    // Check validation
    if (!findProperties(["title", "data"], req.body)) {
        res.status = 412;
        return;
    }
    
    let memo = new Memo({
        title: req.body.title,
        data: req.body.data
    });

    memo.save();
    return memo;
});

app.patch("/memo/:memoId", function *(req, res) {
    var memo = yield Memo.findById(ObjectId(req.params.memoId));

    if (checkNullOrUndefined(memo)) {
        res.code = 404;
        return;
    }

    if (req.body.hasOwnProperty("title")) memo.title = String(req.body.title);
    if (req.body.hasOwnProperty("data")) memo.data = String(req.body.data);

    memo.save();
    return memo;
});

app.delete("/memo/:memoId", function *(req, res) {
    var memo = yield Memo.findById(new ObjectId(req.params.memoId));

    if (checkNullOrUndefined(memo)) {
        res.code = 404;
        return;
    }

    memo.remove();
    return memo;
});

app.listen(setting.port);