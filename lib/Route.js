const http = require('http');

/**
 * A single route which you can use to handle HTTP verbs.
 * Used in {@link Router#route}.
 */
class Route {
    constructor(url, router) {
        this.url = url;
        this.router = router;
    }

    use(...args) {
        this.router.use.apply(this.router, [this.url, ...args]);
        return this;
    }

    all(...args) {
        this.router.all.apply(this.router, [this.url, ...args]);
        return this;
    }
}

http.METHODS.forEach(function(method) {
    Route.prototype[method.toLowerCase()] = function(...args) {
        this.router[method.toLowerCase()].apply(this.router, [this.url, ...args]);
        return this;
    }
});

Route.prototype.del = Route.prototype['delete'];

module.exports = Route;
