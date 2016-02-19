'use strict';

var compose = require('koa-compose');
var Status = require('./status');

module.exports = composer;

/**
 * Composes multiple middlewares into a one function
 * and wraps the handler function if needed.
 *
 * @param {String} method 
 * @param {String} path
 * @param {Function} handler 
 * @param {Array} layers 
 *
 * @return {Function} Wrapped handler function (generator function)
 */
function composer(method, path, handler, layers, dontWrap) {
    if (!layers || layers.length == 0) return dontWrap ? handler : wrap(handler);
    
    // only filter matched layers
    var matched = [];
    for (var i in layers)
        if (layers[i].match(method, path)) matched.push(layers[i].handler);

    matched.push(dontWrap ? handler : wrap(handler));
    return compose(matched);
}

function wrap(handler) {
    return function* cottageWrapper(next) {
        var ret = yield handler.call(this, this.request, this.response, next);
        if (ret instanceof Status) {
            this.status = ret.status;
            this.body = Status.formatCallback(ret);
        }
        else if (ret != null) this.body = ret;
    }
}