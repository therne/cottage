
var cottage = require('..');
var Status = cottage.Status;
var assert = require('assert');
var simulate = require('./testutil');

var app = cottage();

app.get('/customErr', function*() {
    return Status(500, "It's custom error");
});

app.get('/predefined', function*() {
    return Status('predefined_something');
});

app.get('/nothing', function*() {
    return Status(200);
});

describe('Status', function(){
    describe('Routing Test', function() {
        it('should return 500 when GET /customErr', function(done){
            simulate(app, done, 'GET', '/customErr', function(res) {
                res.assert(500, {msg: "It's custom error"});
                done();
            });
        });

        it('should return 200 with no body when GET /nothing', function(done){
            simulate(app, done, 'GET', '/nothing', function(res) {
                res.assert(200, '');
                done();
            });
        });
    });
    describe('#predefine', function() {
        it('should create predefine_something with no errors', function() {
            Status.predefine('predefine_something', {
                status: 401,
                code: 'OH_ERROR',
                msg: 'Oh Error Error',
            });
        });

        it('should resolve predefine_something status', function() {
            var status = Status('predefine_something');
            assert(status);
            status.status.should.equal(401);
            status.code.should.equal('OH_ERROR');
            status.msg.should.equal('Oh Error Error');
        });
    })
})

