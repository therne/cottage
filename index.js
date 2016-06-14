'use strict';

var Application = require('./lib/application');
var Response = require('./lib/response');

exports = module.exports = Application;
exports.Response = Response;

Object.defineProperty(module.exports, 'Status', {
    get: function() {
        console.warn('cottage: Warning: Status is deprecated. use cottage.Response instead');
        return Response;
    }
});