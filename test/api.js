
const Cottage = require('..');
const simulate = require('./testutil');
const crypto = require('crypto');

const testCases = [
    ['Paypal API', require('./apis/paypal')],
    ['Github API', require('./apis/github')],
    ['Twitter API', require('./apis/twitter')],
    ['Google+ API', require('./apis/gplus')],
    ['all APIs merged', require('./apis/merged')],
    ['static directories', require('./apis/static')],
];

describe('A Router', function() {

    for (const [caseName, { api }] of testCases) {
        it(`should serve ${caseName} correctly`, async () => {

            const app = new Cottage();
            for (const [method, url] of api) {
                app[method.toLowerCase()](url, async () => url);
            }

            for (const [method, url] of api) {
                const testUrl = makeTestUrl(url);
                const { res } = await simulate(app, method, testUrl);
                res.assert(200, url);
            }
        });
    }
});


/**
 * Replaces all param (:param1) in URL to random param test string.
 */
function makeTestUrl(url) {
    while (url.indexOf(':') !== -1) {
        url = url.replace(/:\w+/, randStr(1, 8));
    }
    return url;
}

function randStr(min, max) {
    return crypto.randomBytes(Math.floor(Math.random() * (max - min + 1) + min)).toString('base64')
        .replace(/=/g, '').replace(/\+/g, '').replace(/\//g, ''); // url-safe
}
