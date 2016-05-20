
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
    it('should set response status and body', function(done){
        simulate(app, done, 'GET', '/statusWithBody', function(res) {
            res.assert(401, 'Custom Body');
            done();
        });
    });

    it('should set response status only', function(done){
        simulate(app, done, 'GET', '/nothing', function(res) {
            res.assert(200, '');
            done();
        });
    });
    describe('#predefine', function() {
        it('should predefine response with no errors', function() {
            Status.predefine('predefine_something', 401, {
                code: 'OH_ERROR',
                msg: 'Oh Error Error'
            });
        });

        it('should resolve predefined response', function() {
            var status = Status('predefine_something');
            assert(status);
            status.status.should.equal(401);
            status.body.code.should.equal('OH_ERROR');
            status.body.msg.should.equal('Oh Error Error');
        });
    })
})

