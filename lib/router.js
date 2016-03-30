'use strict';

var koa = require('koa');
var http = require('http');
var Tree = require('./tree');
var Layer = require('./layer');
var Route = require('./route');
var composer = require('./composer');
var default404Handler = require('./notfound-handler');
var defaultErrorHandler = require('./error-handler');

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
    if (this instanceof RouterFactory) {
        throw new Error("You need call 'cottage()' to create new router!");
    }

    options = options || {};
    options.strict = options.strict || false;
    options.caseSensitive = options.caseSensitive || false;

    var router = {
        trees: new Map(),
        layers: [],
        errorHandler: defaultErrorHandler,
        notFoundOriginal: default404Handler
    };
    router.notFoundHandler = router.notFoundOriginal;

    /**
     * Handles all request and routes into the correct path.
     *    This method is Koa.js style middleware - that means
     *    you can directly attach Cottage app to Koa app as middleware.
     *
     *    ex) koaApp.use(cottage()).listen(8080)
     */
    var Router = function* Router(next) {
        this.request.params = this.request.params || {};

        try {
            var tree = router.trees.get(this.method);
            if (!tree) return yield* router.notFoundHandler.call(this, next);
            var handler = tree.locate(this.request.path, this.request.params) || router.notFoundHandler;
            return yield* handler.call(this, next);

        } catch (err) {
            if (!router.errorHandler) { throw err; }
            return yield* router.errorHandler.call(this, err);
        }
    };

    // hidden :p
    Object.defineProperty(Router, '_router', { value: router, writable: true });
    Object.defineProperty(Router, '_cottage', { value: true, writable: true });

    Router._register = function(method, path, handler) {
        if (handler instanceof Array) throw new Error("Multiple route callbacks are not supported for now.");
        if (path.length > 1 && path[0] !== '/') throw new Error("Path must be started with '/'");

        if (!options.caseSensitive) path = path.toLowerCase();
        if (!options.strict && path.length != 1 && path[path.length-1] === '/') path = path.substring(0, path.length-1);

        // router sub-mount
        if (handler._cottage) {
            Router._registerRouter(path, handler);
            return;
        }

        // middleware
        if (method === '*' || path === '*') {
            router.layers.push(new Layer(method, path, handler));
            router.notFoundHandler = composer('*', '*', router.notFoundOriginal, router.layers, true); 
            return;
        }

        // compose all middlewares 
        var wrappedCallback = composer(method, path, handler, router.layers);
        if (handler._cottage) Object.defineProperty(wrappedCallback, '_cottage', { value: true });

        var tree = router.trees.get(method);
        if (!tree) {
            tree = new Tree(options);
            router.trees.set(method, tree);
        }
        tree.add(path, wrappedCallback);
    }

    Router._registerRouter = function(path, handler) {
        if (path[path.length-1] !== '/') path += '/';

        // remove child's default handler. use parent's one.
        if (handler._router.errorHandler === defaultErrorHandler)
            handler._router.errorHandler = null;

        // override error handler
        handler._router.notFoundHandler = router.notFoundHandler;
        handler._router.notFoundOriginal = router.notFoundOriginal;

        var composedHandler = composer('*', path, handler, router.layers, true);
        composedHandler._router = handler._router;
        composedHandler._cottage = handler._cottage;

        handler._router.trees.forEach(function(tree, method) {
            var ourTree = router.trees.get(method);
            if (!ourTree) {
                ourTree = new Tree(options);
                router.trees.set(method, ourTree);
            }
            tree.setRootPath(path);
            ourTree.add(path, composedHandler);
        });
    }

    /**
     * Mounts the middleware function(s) at the path.
     * If path is not specified, the middleware will be executed for every request to the this route.

     * NOTE THAT middleware function MUST FOLLOW the Koa.js middleware style, 
     * not the Cottage handler style!
     *    ex) app.use(function*(next) { ... })
     *
     * Therefore, you can attach koa.js middlewares. it's 100% compatible.
     *
     * @param {string} [path]
     * @param {Function} middleware
     */
    Router.use = function(path, middleware) {
        if (path instanceof Function) {
            middleware = path;
            path = '*';
        }
        Router._register('*', path, middleware);
    }

    // handle all HTTP verbs supported by node.js
    http.METHODS.forEach(function(method) {
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
        Router[method.toLowerCase()] = function(path, callback) {
            Router._register(method, path, callback);
        };
    });

    // alias 'del' to 'delete' (Due to JS reserved keywords)
    Router.del = Router['delete'];

    /**
     * NOTE: Different from express, This method is same as 'use' method in Cottage!
     * (because cottage doesn't have an router stack)
     */
    Router.all = function() {
        Router.use.apply(this, arguments);
    }

    Router.visualize = function() {
        router.trees.forEach(function(tree, key) {
            console.log(key + ' TREE : ');
            tree.visualize();
        });
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

    /**
     * @param {Function} handler Error handler
     */
    Router.setErrorHandler = function(handler) {
        router.errorHandler = handler;
    }

    /**
     * @param {Function} handler Not Found (404) handler
     */
    Router.setNotFoundHandler = function(handler) {
        router.notFoundOriginal = handler;
        router.notFoundHandler = composer('*', '*', handler, router.layers, true);
    }

    /**
     * Start server and listen to given port.
     * @param {Number} port Port
     */
    Router.listen = function(port) {
        if (!port || typeof port !== 'number') throw new Error("you must specify port number.");

        // use koa as base framework.
        var app = koa();
        app.use(this).listen(port);
    }

    return Router;
}

module.exports = RouterFactory;
