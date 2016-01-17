
var github = require('./apis/github').api;
var parse = require('./apis/parse').api;
var gplus = require('./apis/gplus').api;
var staticApi = require('./apis/static').api;
var cottage = require('..');
var simulate = require('./testutil');
var crypto = require('crypto');
var async = require('async');

function restApiTest(data, done) {
    var app = cottage();
    data.forEach(function(route) {
        app[route[0].toLowerCase()](route[1], handler);
    });

    async.forEach(data, function(route, next) {
        var url = makeTestableUrl(route[1]);
        simulate(app, next, route[0], url, function(res) {
            res.status.should.equal(200);
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

function* handler(req, res) {
    return 'Correct!';
}

describe('API Routing', function() {
    it ('should route Github API correctly', function(done) {
        restApiTest(github, done);
    });

    it ('should route Google+ API correctly', function(done) {
        restApiTest(gplus, done);
    });

    it ('should route Parse API correctly', function(done) {
        restApiTest(parse, done);
    });

    it ('should route static directory correctly', function(done) {
        restApiTest(staticApi, done);
    });
});
