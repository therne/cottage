
const http = require('http');
const Path = require('path');
const Tree = require('./tree');
const Layer = require('./layer');
const Route = require('./route');
const koaMount = require('koa-mount');
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
class Router {

    constructor(options = {}) {
        this.options = {
            strict: false,
            caseSensitive: false,
            ...options
        };

        this.tree = new Tree(this.options);
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
    callback() {
        const router = this;
        return async function handler(ctx, next) {
            ctx.request.params = ctx.request.params || {};
            const foundHandler = router.tree.locate(ctx.method, ctx.path, ctx.request.params);
            foundHandler(ctx, next);
        }
    }

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
    use(path, middlewares) {
        if (typeof path !== 'string') path = '*';
        this.registerMultiple('*', path, arguments, true);
    };

    /**
     * NOTE: Different from express, This method is same as 'use' method in Cottage!
     * (because cottage doesn't have an router stack)
     */
    all() {
        Router.prototype.use.apply(this, arguments);
    }

    registerMultiple(method, path, args, middlewareOnly = false) {
        const handlers = [];
        for (const arg of args) {
            if (isHandler(arg)) {
                handlers.push(arg);

            } else if (arg instanceof Array) {
                const handlerArgs = arg.filter(x => !isHandler(x));
                handlers.push(...handlerArgs)
            }
        }
        handlers.forEach((middleware, i) => {
            if (!middlewareOnly && i === handlers.length - 1) {
                // everything is middleware except the last one
                this.register(method, path, middleware);

            } else {
                this.register('*', path, middleware);
            }
        });
    }

    register(method, path, handler) {
        if (path.length > 1 && path[0] !== '/') throw new Error("Path must be started with '/'");

        if (!this.options.caseSensitive) {
            path = path.toLowerCase();
        }

        if (!this.options.strict && path.length !== 1 && path[path.length-1] === '/') {
            // path postfix (/) stripping.
            path = path.substring(0, path.length-1);
        }

        if (handler instanceof Router) {
            this.mergeWithChildRouter(path, handler);
            return;
        }

        // middleware
        if (method === '*' || path === '*') {
            // path prefix stripping for middlewares
            if (path !== '*') {
                handler = koaMount(path, handler);
            }
            this.tree.addMiddleware(method,
                path === '*' ? '/' : path,
                composer.middleware(method, path, this.layers, [handler]));

            this.layers.push(new Layer(method, path, handler));
            this.tree.defaultHandler = composer.middleware('*', '/', this.layers);
            return;
        }

        // compose all middlewares
        const wrappedHandler = composer(method, path, handler, this.layers);
        this.tree.addHandler(method, path, wrappedHandler);
    }

    mergeWithChildRouter(mountPath, childRouter) {
        if (mountPath.length > 1 && mountPath[mountPath.length - 1] === '/') {
            mountPath = mountPath.slice(0, mountPath.length - 1);
        }

        // 1. clone tree
        const childTree = childRouter.tree.clone();
        childTree.setRootPath(mountPath);
        childTree.traverse((nodePath, node) => {
            // compose parent middleware into child node
            for (const method in node.handlers) {
                node.handlers[method] = composer.middleware(method, nodePath, this.layers, [node.handlers[method]]);
            }
        });
        childTree.defaultHandler = composer.middleware('*', mountPath, this.layers, [childTree.defaultHandler]);
        this.tree.merge(mountPath, childTree);

        // 2. to prevent side-effect, copy child's middleware stack
        const childLayers = [];
        for (const { method, path, handler } of childRouter.layers) {
            childLayers.push(new Layer(method, path, handler));
        }

        // 3. update sub-router's middleware path to changed path
        childLayers.forEach(layer => layer.setPath(Path.join(mountPath, layer.path)));

        // add to parent's middleware stack
        this.layers.push(...childLayers);
    }

    /**
     * Returns an instance of a single route which you can then use to handle HTTP verbs.
     * Use router.route() to avoid duplicate route naming and thus typo errors.
     *
     * @param {string} path
     * @returns {Route}
     */
    route(path) {
        return new Route(path, this);
    }

    /**
     * @param {Function} handler Not Found (404) handler
     */
    setNotFoundHandler(handler) {
        this.notFoundHandler = handler;
        this.layers[0].handler = handler;
        this.tree.defaultHandler = composer.middleware('*', '/', this.layers);
    }
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
    Router.prototype[method.toLowerCase()] = function(path, callback) {
        this.registerMultiple(method, path, arguments);
    };
});

// alias 'del' to 'delete' (Due to JS reserved keywords)
Router.prototype.del = Router.prototype['delete'];

function isHandler(handler) {
    return typeof handler === 'function' || handler instanceof Router;
}

module.exports = Router;
