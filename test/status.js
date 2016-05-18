
var cottage = require('..');
var Status = cottage.Status;
var assert = require('assert');
var simulate = require('./testutil');

var app = cottage();

app.get('/predefined', function*() {
    return Status('predefined_something');
});

app.get('/nothing', function*() {
    return Status(200);
});

app.get('/statusWithBody', function*() {
    return Status(401, 'Custom Body');
});

describe('Status', function(){
    describe('Routing Test', function() {
        it('should return 401 with body', function(done){
            simulate(app, done, 'GET', '/statusWithBody', function(res) {
                res.assert(401, 'Custom Body');
                done();
            });
        });

        it('should return 200 with no body', function(done){
            simulate(app, done, 'GET', '/nothing', function(res) {
                res.assert(200, '');
                done();
            });
        });
    });
    describe('#predefine', function() {
        it('should create predefine_something with no errors', function() {
            Status.predefine('predefine_something', 401, {
                code: 'OH_ERROR',
                msg: 'Oh Error Error'
            });
        });

        it('should resolve predefine_something status', function() {
            var status = Status('predefine_something');
            assert(status);
            status.status.should.equal(401);
            status.body.code.should.equal('OH_ERROR');
            status.body.msg.should.equal('Oh Error Error');
        });
    })
})

