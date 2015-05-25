
function Layer(method, path, pathSplited, callback) {
    this.method = method.toUpperCase();
    this.path = pathSplited;
    this.originalPath = path;
    this.callback = callback;
}

Layer.prototype.match = function(context, pathSplited) {
    var skip = context._skip ? context._skip : 0;
    if (pathSplited.length != this.path.length+skip) return false;

    for (var i=1,len=this.path.length; i<len; i++) {
        var path = this.path[i];
        var reqPath = pathSplited[parseInt(i + skip)];
        console.log(path);
        console.log(reqPath);
        console.log('===');

        // param mapping
        if (path[0] === ':') {
            context.request.params[path.substring(1)] = this.path[i];
            continue;
        }

        // asterisk
        if (path === '*') continue;

        if (path.length !== reqPath.length) return false;
        if (path !== reqPath) return false;
    }
    return true;
}

module.exports = Layer;
