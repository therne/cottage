
const delegate = require('delegates');

/**
 * Simulates Koa.
 */
module.exports = async function simulateRequest(app, method, path) {
    const context = {
        request: {
            method,
            path,
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
    await app.callback()(context, noMatch);

    return { ctx: context, res: context.response };
};


/**
 * Called when nothing matched.
 */
async function noMatch(){ }
