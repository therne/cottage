'use strict';

var http = require('http');

module.exports = function* cottageError(err) {
    if (!isNaN(parseInt(err.message))) {
        var status = parseInt(err.message);
        this.body = http.STATUS_CODES[status];
        this.status = status;
    }
    else this.body = err.stack;
}