'use strict';

var methods = require('methods');
var Status = require('./status');
var Route = require('./route');
var Layer = require('./layer');
var Path = require('path');

/**
 * Returns new Router instance, which makes you to code like Express style in Koa.js.
 *
 * According to Express Documentation:
 *    A router object is an isolated instance of middleware and routes.
 *   You can think of it as a “mini-application,” capable only of performing middleware
 *   and routing functions. Every Express application has a built-in app router.
 *   A router behaves like middleware itself, so you can use it as an argument to app.use()
 *   or as the argument to another router’s use() method.
 *
 * @param {object} [options]
 */
function RouterFactory(options) {
    options = options || {};
    var router = {
        caseSensitive: options.caseSensitive || false,
        strict: options.strict || false,
        layers: []
    };

    var Router = function*(next) {
        var _path = this.request.path;
        if (!router.caseSensitive) _path = _path.toLowerCase();
        var path = _path.split('/');

        if (!router.strict && path[path.length-1].length == 0) path.pop();

        this.request.params = {};

        var matched = [];
        for (var i in router.layers) {
            var layer = router.layers[i];
            if (layer.method !== '*' && layer.method !== this.method) continue;

            // nested route
            if (layer.callback._register && _path.indexOf(layer.originalPath) == 0) {
                var len = layer.path.length;
                this._skip = (this._skip || 0) + (layer.path[len-1].length == 0 ? len-2 : len-1);
                matched.push(layer);
                break;
            }

            // middleware
            if (layer.method === '*' && layer.path[0] === '*') {
                matched.push(layer);
                continue;
            }

            if (layer.match(this, path)) {
                matched.push(layer);
                break;
            }
        }

        i = matched.length;
        while (i--) next = matched[i].callback.call(this, next);
        return yield* next;
    };

    Router._register = function(method, path, callback, isMiddleware) {
        if (arguments.length > 3 && isMiddleware instanceof Function)
            throw new Error("Multiple route callbacks are not supported for now.");

        if (!router.caseSensitive) path = path.toLowerCase();

        var p = path.split('/');
        if (!router.strict && p[p.length-1].length == 0) p.pop();

        var cb = callback;
        if (!isMiddleware) {
            // wrap the function.
            cb = function* wrapper(next) {
                var ret = yield callback(this.request, this.response, next);
                if (!ret) return;
                if (typeof ret === 'number') this.status = ret;
                else if (ret instanceof Status) {
                    this.status = ret.status;
                    this.body = Status.formatCallback(ret);
                }
                else this.body = ret;
            }
        }

        router.layers.push(new Layer(method, path, p, cb));
    }

    /**
     * Mounts the express middleware function(s) at the path.
     */
    Router.express = function(path, middleware) {
        
    }

    /**
     * Mounts the middleware function(s) at the path.
     * If path is not specified, the middleware will be executed for every request to the this route.

     * NOTE THAT middleware function MUST FOLLOW koa.js middleware style,
     * not the Cottage handler style.
     *
     * @param {string} [path]
     * @param {Function} middleware
     */
    Router.use = function(path, middleware) {
        if (path instanceof Function) {
            middleware = path;
            path = '*';
        }
        Router._register('*', path, middleware, true);
    }

    // handle all HTTP verbs supported by node.js
    methods.forEach(function(method) {
        /**
         * The router.METHOD() methods provide the routing functionality in Cottage, like express,
         * where METHOD is one of the HTTP methods, such as GET, PUT, POST, and so on, in lowercase.
         * Thus, the actual methods are router.get(), router.post(), router.put(), and so on.
         * 
         * Multiple callbacks are not supported for now.
         *
         * @param {string} path 
         * @param {Function} callback
         */
        Router[method] = function(path, callback) {
            Router._register(method, path, callback);
        };
    });

    // alias 'del' to 'delete' (Due to JS reserved keywords)
    Router.del = Router['delete'];

    /**
     * This method functions just like the router.METHOD() methods,
     * except that it matches all HTTP verbs.
     *
     * @param {string} path 
     * @param {Function} callback
     */
    Router.all = function(path, callback) {
        Router._register('*', path, callback);
    }

    /**
     * Returns an instance of a single route which you can then use to handle HTTP verbs.
     * Use router.route() to avoid duplicate route naming and thus typo errors.
     *
     * @param {string} path 
     * @returns {Route}
     */
    Router.route = function(path) {
        return new Route(path, this);
    }

    return Router;
}

module.exports = RouterFactory;
