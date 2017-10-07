
const Koa = require('koa');
const Router = require('./router');

class Application extends Router {
    constructor(options) {
        super(options);
    }

    /**
     * Start server and listen to given port.
     * This is a shorthand for:
     *    require('koa')().use(app.callback()).listen()
     *
     * @see {@link https://nodejs.org/dist/latest-v4.x/docs/api/http.html|Node.js http module docs}
     */
    listen() {
        // use koa as base framework.
        const app = (new Koa).use(this.callback());
        app.listen.apply(app, arguments);
    }
}

module.exports = Application;
