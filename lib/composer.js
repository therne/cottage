
const compose = require('koa-compose');
const Response = require('./response');

/**
 * Composes multiple middlewares into a one function
 * and wraps the handler function if needed.
 *
 * @param {String} method
 * @param {String} path
 * @param {Function} handler 
 * @param {Array} layers - Middleware layers
 *
 * @return {Function} Wrapped handler function (generator function)
 */
function composer(method, path, handler, layers) {
    if (!layers || layers.length === 0) return wrap(handler);
    
    // only filter matched layers
    let matched = [];
    for (let i in layers)
        if (layers[i].match(method, path)) matched.push(layers[i].handler);

    matched.push(wrap(handler));
    return compose(matched);
}

/**
 * Composes middlewares.
 *
 * @param {String} method
 * @param {String} path
 * @param {Array} layers - Middleware layers
 * @param {Array} [middlewares] - Middlewares
 * @returns {GeneratorFunction}
 */
function composeMiddleware(method, path, layers, middlewares) {
    if (!middlewares) middlewares = [];

    // only filter matched layers
    let matched = [];
    for (let i in layers)
        if (layers[i].match(method, path)) matched.push(layers[i].handler);

    return compose(matched.concat(middlewares));
}

function wrap(handler) {
    /**
     * Wrapped handler.
     * It sets returned value from real handler to be response body.
     */
    return async function cottageWrapper(ctx, next) {
        let ret = yield handler.call(this, ctx, next);

        if (ret instanceof Response) {
            ctx.status = ret.status;
            ctx.body = ret.body;

        } else if (ret) {
            ctx.body = ret;
        }
    }
}

module.exports = composer;
module.exports.middleware = composeMiddleware;