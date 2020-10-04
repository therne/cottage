import { Server } from 'http';
import { ListenOptions } from 'net';
import * as Stream from 'stream';
import { DefaultState, DefaultContext, ParameterizedContext, Middleware as KoaMiddleware } from 'koa';

declare namespace cottage {

    /**
     * Cottage is alias of {@link cottage.Application}.
     */
    class Cottage extends Application {}

    class Application extends Router {
        /**
         * Start server and listen to given port.
         *
         * Shorthand for:
         *    Koa().use(app.callback()).listen(...)
         *
         * @see {@link https://nodejs.org/api/net.html#net_server_listen net.Server#listen()}
         */
        listen(port?: number, hostname?: string, backlog?: number, listener?: () => void): Server;
        listen(port: number, hostname?: string, listener?: () => void): Server;
        listen(port: number, backlog?: number, listener?: () => void): Server;
        listen(port: number, listener?: () => void): Server;
        listen(path: string, backlog?: number, listener?: () => void): Server;
        listen(path: string, listener?: () => void): Server;
        listen(options: ListenOptions, listener?: () => void): Server;
        listen(handle: any, backlog?: number, listener?: () => void): Server;
        listen(handle: any, listener?: () => void): Server;
    }

    class Router {
        /**
         * Creates a router with options.
         */
        constructor(options?: RouterOptions);

        /**
         * Handles all request and routes into the correct path.
         * This method is Koa.js style middleware - meaning you can directly
         * attach Cottage app to Koa app as middleware.
         *
         * Example:
         *   koaApp.use(cottage.callback()).listen(8080)
         */
        callback(): KoaMiddleware;

        /**
         * Returns an instance of a single route which you can then use to handle HTTP verbs.
         * Use router.route() to avoid duplicate route naming and thus typo errors.
         */
        route(path: string): Route;

        /**
         * Sets not found handler.
         * Called when nothing is matched from the incoming request.
         *
         * NOTE THAT you should always call `await next()` at last in handler to
         *     continue executing the middleware chain.
         *     If you don't, the not found handler will not be executed.
         */
        setNotFoundHandler(handler: KoaCompatibleMiddleware);

        /**
         * Mounts the middleware function(s) at the path.
         * Middleware function will be executed every time the router receives the request.
         * If path is specified, it will be executed for the request on the given path.
         *
         * NOTE THAT middleware function MUST BE Koa.js middleware.
         *    DO) app.use(async (ctx, next) => { ... })
         *    DON'T) app.use(async (req, res, next) => { ... })
         *
         * ALSO NOTE THAT due to the koa.js middleware compatibility,
         * the context.path value will be 'stripped' - means that
         * given path prefix will be removed temporarily only for this middleware.
         *
         * It does the same thing that koa-mount does. Because of this,
         * you can use some koa.js middlewares (ex: koa-serve) without using koa-mount.
         */
        use(...middlewares: Handler[]);
        use(path: string, ...middlewares: Handler[]);

        /**
         * Handles all methods with a given path.
         * If no path is given, it behaves almost like `router.use` with only one difference:
         *
         * `router.use()` will execute notFoundHandler if nothing is matched,
         * however `router.all()` will always match the handler, thus not calling notFoundHandler.
         */
        all(...handlers: Handler[]);
        all(path: string, ...handlers: Handler[]);

        /**
         * Handles HTTP GET method.
         */
        get(path: string, ...handlers: Handler[]);

        /**
         * Handles HTTP POST method.
         */
        post(path: string, ...handlers: Handler[]);

        /**
         * Handles HTTP PUT method.
         */
        put(path: string, ...handlers: Handler[]);

        /**
         * Handles HTTP LINK method.
         */
        link(path: string, ...handlers: Handler[]);

        /**
         * Handles HTTP UNLINK method.
         */
        unlink(path: string, ...handlers: Handler[]);

        /**
         * Handles HTTP DELETE method.
         */
        delete(path: string, ...handlers: Handler[]);

        /**
         * Alias for Router#delete() because it's a reserved word.
         */
        del(path: string, ...handlers: Handler[]);

        /**
         * Handles HTTP HEAD method.
         */
        head(path: string, ...handlers: Handler[]);

        /**
         * Handles HTTP OPTIONS method.
         */
        options(path: string, ...handlers: Handler[]);

        /**
         * Handles HTTP PATCH method.
         */
        patch(path: string, ...handlers: Handler[]);
    }

    class Route {
        /**
         * Mounts the middleware function(s) at the path.
         * Middleware function will be executed every time the router receives the request.
         * If path is specified, it will be executed for the request on the given path.
         *
         * NOTE THAT middleware function MUST BE Koa.js middleware.
         *    DO) app.use(async (ctx, next) => { ... })
         *    DON'T) app.use(async (req, res, next) => { ... })
         *
         * ALSO NOTE THAT due to the koa.js middleware compatibility,
         * the context.path value will be 'stripped' - means that
         * given path prefix will be removed temporarily only for this middleware.
         *
         * It does the same thing that koa-mount does. Because of this,
         * you can use some koa.js middlewares (ex: koa-serve) without using koa-mount.
         */
        use(...middlewares: Handler[]);
        use(path: string, ...middlewares: Handler[]);

        /**
         * NOTE: Different from express, This method is same as 'use' method in Cottage!
         * (because cottage doesn't have an router stack)
         */
        all(...handlers: Handler[]);
        all(path: string, ...handlers: Handler[]);

        /**
         * Handles HTTP GET method.
         * @returns {Route} this
         */
        get(path: string, ...handlers: Handler[]): Route;

        /**
         * Handles HTTP POST method.
         * @returns {Route} this
         */
        post(path: string, ...handlers: Handler[]): Route;

        /**
         * Handles HTTP PUT method.
         * @returns {Route} this
         */
        put(path: string, ...handlers: Handler[]): Route;

        /**
         * Handles HTTP LINK method.
         * @returns {Route} this
         */
        link(path: string, ...handlers: Handler[]): Route;

        /**
         * Handles HTTP UNLINK method.
         * @returns {Route} this
         */
        unlink(path: string, ...handlers: Handler[]): Route;

        /**
         * Handles HTTP DELETE method.
         * @returns {Route} this
         */
        delete(path: string, ...handlers: Handler[]): Route;

        /**
         * Alias for Router#delete() because it's a reserved word.
         * @returns {Route} this
         */
        del(path: string, ...handlers: Handler[]): Route;

        /**
         * Handles HTTP HEAD method.
         * @returns {Route} this
         */
        head(path: string, ...handlers: Handler[]): Route;

        /**
         * Handles HTTP OPTIONS method.
         * @returns {Route} this
         */
        options(path: string, ...handlers: Handler[]): Route;

        /**
         * Handles HTTP PATCH method.
         * @returns {Route} this
         */
        patch(path: string, ...handlers: Handler[]): Route;
    }

    class Response {
        status: number;
        body: ResponseBody;

        /**
         * Creates a {@link cottage.Response} instance,
         * which can be returned in a cottage middleware.
         */
        constructor(status: number, body?: ResponseBody);

        /**
         * Predefine a response globally with given name.
         * The defined response can be loaded through `Response.from(name)`.
         */
        static define(name: string, status: number, body: ResponseBody);

        /**
         * Loads predefined status registered with given name.
         */
        static from(name: string): Response;
    }

    type RouterOptions = {
        caseSensitive?: boolean;
        strict?: boolean;
    }

    type Context<
        StateT = DefaultState,
        CustomT = DefaultContext,
    > = ParameterizedContext<StateT, CustomT>;

    /**
     * Cottage middleware is almost same with {@link KoaMiddleware},
     * except it allows returning a response body or {@link cottage.Response} instance.
     */
    type Middleware<
        StateT,
        CustomT,
    > = (ctx: Context<StateT, CustomT>, next: () => Promise<any>) => ResponseBody | Response;

    /**
     * Possible response bodies can be returned from cottage.
     */
    type ResponseBody =
        string | Buffer // written
        | Stream // piped
        | Object | Array<any> // json-stringified (with Content-Type: application/json)
        | null; // no content response

    /**
     * Cottage accepts both cottage-style middleware and koa-style middleware.
     */
    type KoaCompatibleMiddleware<StateT = DefaultState, CustomT = DefaultState> =
        Middleware<StateT, CustomT> | KoaMiddleware<StateT, CustomT>;

    type Handler<StateT = DefaultState, CustomT = DefaultContext> =
        Router | KoaCompatibleMiddleware<StateT, CustomT>;
}

export = cottage;
