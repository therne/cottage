
var cottage = require('..');
var simulate = require('./testutil');

var app = cottage();

app.get('/', function*() {
    return "Root"
});

app.post('/user', function*() {
    return "New User"
});

app.get('/user/:id', function*(req) {
    return "id is " + req.params.id;
});


describe('Router', function(){
    it('should return "Root" when GET / request sent', function(done){
        simulate(app, done, 'GET', '/', function(res) {
            res.assert(200, 'Root');
            done();
        });
    });

    it('should return "New User" when POST /user request sent', function(done){
        simulate(app, done, 'POST', '/user', function(res) {
            res.assert(200, 'New User');
            done();
        });
    });

    it('should return 404 Error when GET /nowhere request sent', function(done){
        simulate(app, done, 'GET', '/nowhere', function(res) {
            res.assert(404, 'Not Found');
            done();
        });
    });

    it('should map parameter when GET /user/:id', function(done){
        simulate(app, done, 'GET', '/user/retail3210', function(res) {
            res.assert(200, 'id is retail3210');
            done();
        });
    });

})

