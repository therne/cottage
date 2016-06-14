
var cottage = require('..');
var simulate = require('./testutil');
var crypto = require('crypto');
var async = require('async');

var testCases = [
    ['Paypal API', require('./apis/paypal')],
    ['Github API', require('./apis/github')],
    ['Twitter API', require('./apis/twitter')],
    ['Google+ API', require('./apis/gplus')],
    ['all APIs merged', require('./apis/merged')],
    ['static directories', require('./apis/static')],
];

function restApiTest(data, done) {
    var app = cottage();
    data.forEach(function(route) {
        app[route[0].toLowerCase()](route[1], function* handler() { return route[1] });
    });

    async.forEach(data, function(route, next) {
        var url = makeTestableUrl(route[1]);
        simulate(app, next, route[0], url, function(res) {
            res.status.should.equal(200, 'expected ' + route[1] + ' to be served');
            res.body.should.equal(route[1]);
            next();
        })
    }, done);
}

function randStr(min, max) {
    return crypto.randomBytes(Math.floor(Math.random() * (max - min + 1) + min)).toString('base64')
        .replace(/=/g, '').replace(/\+/g, '').replace(/\//g, ''); // url-safe
}

/**
 * Replaces all param (:param1) in URL to random param test string.
 */
function makeTestableUrl(url) {
    while (url.indexOf(':') != -1) url = url.replace(/:\w+/, randStr(1, 8));
    return url;
}

describe('Router', function() {
    testCases.forEach(function(tuple) {
        it('should serve ' + tuple[0] + ' correctly', function(done) {
            restApiTest(tuple[1].api, done);
        });
    });
});
