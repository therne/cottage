
function Layer(method, path, handler) {
    this.method = method.toUpperCase();
    this.path = path.split('/').slice(1);
    this.handler = handler;
}

Layer.prototype.match = function(method, path) {
    if (this.method !== '*' && this.method !== method) return false;
    var splitedPath = path.split('/').slice(1);

    for (var i in this.path) {
        var layerPath = this.path[i];
        var reqPath = splitedPath[i];

        if (layerPath[0] === ':') continue;
        if (layerPath === '*') return true;

        if (layerPath !== reqPath) return false;
    }
    return true;
}

module.exports = Layer;
