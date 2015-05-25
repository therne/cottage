
var methods = require('methods');

function Route(url, router) {
    this.url = url;
    this.router = router;
}

methods.forEach(function(method) {
    Route.prototype[method] = function(handler) {
        this.router._register(method, this.url, handler);
        return this; // method chaining
    }
});

Route.prototype.del = Route.prototype['delete'];

Route.prototype.all = function(path, handler) {
    this.router._register('*', this.url, handler);
    return this;
}

module.exports = Route;
