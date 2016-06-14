'use strict';

/**
 * Middleware layer.
 * @private
 * @constructor
 */
function Layer(method, path, handler) {
    this.method = method.toUpperCase();
    this.setPath(path);
    this.handler = handler;
}

Layer.prototype.setPath = function(path) {
    this.path = path;
    this.pathSegments = path.split('/').slice(1);
};

Layer.prototype.match = function(method, path) {
    if (this.method !== '*' && this.method !== method) return false;
    var splitedPath = path.split('/').slice(1);

    for (var i in this.pathSegments) {
        var layerPath = this.pathSegments[i];
        var reqPath = splitedPath[i];

        if (layerPath[0] === ':') continue;
        if (layerPath === '*') return true;

        if (layerPath !== reqPath) return false;
    }
    return true;
}

module.exports = Layer;
