'use strict';

var Router = require('./lib/router');
var Response = require('./lib/response');

exports = module.exports = Router;
exports.Response = Response;

Object.defineProperty(module.exports, 'Status', {
    get: function() {
        console.warn('cottage: Warning: Status is deprecated. use cottage.Response instead');
        return Response;
    }
});