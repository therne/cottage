'use strict';

const http = require('http');

/**
 * Returns an instance of a single route which you can then use to handle HTTP verbs.
 * Used in {@link Router#route}.
 */
function Route(url, router) {
    this.url = url;
    this.router = router;
}

http.METHODS.forEach(function(method) {
    Route.prototype[method] = function() {
        this.router[method].apply(this.router, concat(this.url, arguments));
        return this; // method chaining
    }
});

Route.prototype.del = Route.prototype['delete'];

Route.prototype.use = Route.prototype.all = function() {
    this.router.use.apply(this.router, concat(this.url, arguments));
    return this;
};

function concat(param, args) {
    const arr = [param];
    for (let arg of args) arr.push(arg);
    return arr;
}

module.exports = Route;
