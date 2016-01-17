
var co = require('co');
var delegate = require('delegates');

/**
 * Called when nothing matched.
 */
function* noMatch(){ }

/**
 * Simulates koa request.
 *
 * @param app Request Handler
 * @param done mocha.js test finishing callback
 * @param method
 * @param path
 * @param callback
 */
module.exports = function simulateRequest(app, done, method, path, callback) {
    var context = {
        request: {
            method: method,
            path: path,
            header: [],
            headers: [],
            href: 'http://localhost:8080'+path,
        },
        response: {
            /**
             * simple test helper function.
             */
            assert: function(status, body) {
                this.status.should.equal(status);
                this.body.toString().should.equal(body.toString());
            },
            res: {
                body: 'Not Found',
            },
            status: 404,
            get body() {
                return this.res.body
            },
            set body(val) {
                if (this.status == 404) this.status = 200;
                this.res.body = val
            },
            type: 'text/plain; charset=utf-8'
        }
    };

    delegate(context, 'request')
        .access('method')
        .access('path');

    delegate(context, 'response')
        .access('body')
        .access('status');

    // simulate middleware composition / writing
    co.wrap(function*() {
        return yield* app.call(this, noMatch()); 
    })
    .call(context)
    .then(function() {
        callback(context.response);
    })
    .catch(done);
}

