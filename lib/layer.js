
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
    else if (this.path === '*') return true;
    var splitedPath = path.split('/').slice(1);

    for (var i in this.pathSegments) {
        var layerPath = this.pathSegments[i];
        var reqPath = splitedPath[i];

        if (layerPath[0] === ':') continue;
        if (layerPath === '*') return true;

        if (layerPath !== reqPath) return false;
    }
    // TODO: what if path mismatches?
    if (this.pathSegments.length !== splitedPath.length) return false;
    return true;
}

module.exports = Layer;
