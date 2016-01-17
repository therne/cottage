'use strict';

var http = require('http');

module.exports = function* cottage404(err) {
    this.body = '<h1>Not Found</h1><p>The URL you requested was not found.</p>';
    this.status = 404;
}
