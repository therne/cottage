'use strict';

const koa = require('koa');
const util = require('util');
const Router = require('./router');

function Application(options) {
    if (!(this instanceof Application)) return new Application(options);
    Application.super_.call(this, options);
}

util.inherits(Application, Router);

/**
 * Start server and listen to given port.
 * This is a shorthand for:
 *    require('koa')().use(app.callback()).listen()
 *
 * @see {@link https://nodejs.org/dist/latest-v4.x/docs/api/http.html|Node.js http module docs}
 */
Application.prototype.listen = function() {
    // use koa as base framework.
    let app = koa().use(this.callback());
    app.listen.apply(app, arguments);
};

module.exports = Application;