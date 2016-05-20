
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
