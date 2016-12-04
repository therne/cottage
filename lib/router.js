'use strict';

const koa = require('koa');
const http = require('http');
const Path = require('path');
const Tree = require('./tree');
const Layer = require('./layer');
const Route = require('./route');
const mount = require('koa-mount');
const composer = require('./composer');
const default404Handler = require('./notfound-handler');

/**
 * Returns new Cottage router instance.
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
function Router(options) {
    if (!(this instanceof Router)) return new Router(options);

    options = options || {};
    this.strict = options.strict || false;
    this.caseSensitive = options.caseSensitive || true;

    this.tree = new Tree(options);
    this.layers = [];
    this.notFoundHandler = default404Handler;

    // notFoundHandler must be at the top
    this.tree.defaultHandler = this.notFoundHandler;
    this.layers.push(new Layer('*', '/', this.notFoundHandler));
}

/**
 * Handles all request and routes into the correct path.
 *    This method is Koa.js style middleware - that means
 *    you can directly attach Cottage app to Koa app as middleware.
 *
 *    ex) koaApp.use(cottage.callback()).listen(8080)
 */
Router.prototype.callback = function() {
    let router = this;
    return function* handler(next) {
        this.request.params = this.request.params || {};
        let handler = router.tree.locate(this.method, this.path, this.request.params);
        return yield* handler.call(this, next);
    }
};

/**
 * Mounts the middleware function(s) at the path.
 * Middleware function will be executed every time the router receives the request.
 * If path is specified, it will be executed for the request on the given path.
 *
 * NOTE THAT middleware function MUST FOLLOW the Koa.js middleware style.
 *    DO) app.use(function*(next) { ... })
 *    DON'T) app.use(function*(req, res, next) { ... })
 *
 * Therefore, you can use koa.js middlewares. it's fully compatible.
 *
 * ALSO NOTE THAT due to the koa.js middleware compatibility,
 * the context.path value will be 'stripped' - means that
 * given path prefix will be removed temporarily only for this middleware.
 *
 * It does the same thing that koa-mount does. Because of this,
 * you can use some koa.js middlewares (ex: koa-serve) without using koa-mount.
 *
 * @param {string} [path]
 * @param {Array} middlewares
 */
Router.prototype.use = function(path, middlewares) {
    if (typeof path !== 'string') path = '*';
    registerMultiple(this, '*', path, arguments, true);
};

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
    Router.prototype[method.toLowerCase()] = function(path, callback) {
        registerMultiple(this, method, path, arguments, false);
    };
});

// alias 'del' to 'delete' (Due to JS reserved keywords)
Router.prototype.del = Router.prototype['delete'];

/**
 * NOTE: Different from express, This method is same as 'use' method in Cottage!
 * (because cottage doesn't have an router stack)
 */
Router.prototype.all = function() {
    Router.prototype.use.apply(this, arguments);
};

/**
 * Returns an instance of a single route which you can then use to handle HTTP verbs.
 * Use router.route() to avoid duplicate route naming and thus typo errors.
 *
 * @param {string} path
 * @returns {Route}
 */
Router.prototype.route = function(path) {
    return new Route(path, this);
};

/**
 * @param {Function} handler Not Found (404) handler
 */
Router.prototype.setNotFoundHandler = function(handler) {
    this.notFoundHandler = handler;
    this.layers[0].handler = handler;
    this.tree.defaultHandler = composer.middleware('*', '/', this.layers);
};

function register(router, method, path, handler) {
    if (path.length > 1 && path[0] !== '/') throw new Error("Path must be started with '/'");

    if (!router.caseSensitive) path = path.toLowerCase();
    if (!router.strict && path.length != 1 && path[path.length-1] === '/') path = path.substring(0, path.length-1);

    if (handler instanceof Router) {
        registerRouter(router, path, handler);
        return;
    }

    // middleware
    if (method === '*' || path === '*') {
        // path prefix stripping for middlewares
        if (path !== '*') {
            handler = mount(path, handler);
        }
        router.tree.addMiddleware(method,
            path == '*' ? '/' : path,
            composer.middleware(method, path, router.layers, [handler]));

        router.layers.push(new Layer(method, path, handler));
        router.tree.defaultHandler = composer.middleware('*', '/', router.layers);
        return;
    }

    // compose all middlewares
    let wrappedCallback = composer(method, path, handler, router.layers);
    router.tree.addHandler(method, path, wrappedCallback);
}

function registerRouter(router, path, subrouter) {
    if (path.length > 1 && path[path.length - 1] === '/') path = path.slice(0, path.length - 1);

    // to prevent side-effect, clone middleware stack
    let subLayers = [];
    for (let layer of subrouter.layers) {
        subLayers.push(new Layer(layer.method, layer.path, layer.handler));
    }

    // change sub-router's middleware path to changed path
    for (let layer of subLayers) {
        layer.setPath(Path.join(path, layer.path));
    }

    let subTree = subrouter.tree.clone();
    subTree.setRootPath(path);
    subTree.traverse(function(nodePath, node) {
        // compose parent middleware into child node
        for (let method in node.handlers) {
            node.handlers[method] = composer.middleware(method, nodePath, router.layers, [node.handlers[method]]);
        }
    });
    subTree.defaultHandler = composer.middleware('*', path, router.layers, [subTree.defaultHandler]);
    router.tree.merge(path, subTree);

    // add to parent's middleware stack
    router.layers = router.layers.concat(subLayers);
}

function registerMultiple(router, method, path, args, middlewareOnly) {
    let handlers = [];
    for (let i in args) {
        if (args[i] instanceof Array) {
            handlers = handlers.concat(
                args[i].filter(function(f) {
                    return typeof f !== 'function' && !(f instanceof Router);
                }));
        }
        else if (typeof args[i] === 'function' || args[i] instanceof Router) {
            handlers.push(args[i]);
        }
    }
    handlers.forEach(function(middleware, i) {
        // everything is middleware except the last one
        if (!middlewareOnly && i === handlers.length - 1) {
            register(router, method, path, middleware);
        }
        else register(router, '*', path, middleware);
    });
}

module.exports = Router;
