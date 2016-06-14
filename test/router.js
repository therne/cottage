
var cottage = require('..');
var simulate = require('./testutil');
var util = require('util');

var app = cottage();
var NOT_FOUND = '<h1>Not Found</h1><p>The URL you requested was not found.</p>';

app.get('/', function*() {
    return "Root"
});

app.post('/user', function*() {
    return "New User"
});

app.get('/user/:id', function*(req) {
    return "id is " + req.params.id;
});

app.get('/user/:id/:id2/:id3/:id4', function*(req) {
    return util.format("%s %s %s %s", req.params.id, req.params.id2, req.params.id3,
        req.params.id4);
});

describe('Router', function(){
    it('should route root path', function(done){
        simulate(app, done, 'GET', '/', function(res) {
            res.assert(200, 'Root');
            done();
        });
    });

    it('should route nested path', function(done){
        simulate(app, done, 'POST', '/user', function(res) {
            res.assert(200, 'New User');
            done();
        });
    });

    it('can return 404 error', function(done){
        simulate(app, done, 'GET', '/nowhere', function(res) {
            res.assert(404, NOT_FOUND);
            done();
        });
    });

    it('can handle error', function(done) {
        let errApp = cottage();
        errApp.setErrorHandler(function*(err) {
            this.status = 500;
            this.body = 'Error';
        });
        errApp.get('/', function*() { throw Error(); });
        simulate(errApp, done, 'GET', '/', function(res) {
            res.assert(500, 'Error');
            done();
        });
    });

    it('can define route with route()', function(done) {
        let rouApp = cottage();
        rouApp.route('/hello')
            .use(function*(next) {
                this.body = 'Mid ';
                yield next;
            })
            .get(function*(req, res) {
                res.body += 'Hi~';
            });

        simulate(rouApp, done, 'GET', '/hello', function(res) {
            res.assert(200, 'Mid Hi~');
            done();
        });
    });



    it('can have duplicated handler', function(done) {
        var app = cottage();

        app.get('/duplicated', function*(req, res, next) {
            res.body = 'First ';
            yield *next;
        });

        app.get('/duplicated', function*(req, res) {
            res.body += 'Second';
        });

        simulate(app, done, 'GET', '/duplicated', function(res) {
            res.assert(200, 'First Second');
            done();
        });
    });

    it('should map parameter', function(done){
        simulate(app, done, 'GET', '/user/retail3210', function(res) {
            res.assert(200, 'id is retail3210');
            done();
        });
    });

    it('should map multiple parameter ', function(done){
        simulate(app, done, 'GET', '/user/a/bcd/ef/g', function(res) {
            res.assert(200, 'a bcd ef g');
            done();
        });
    });
})
