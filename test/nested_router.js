
var cottage = require('..');
var simulate = require('./testutil');

var app = cottage();
var NOT_FOUND = '<h1>Not Found</h1><p>The URL you requested was not found.</p>';

var root = cottage();
root.get('/', function*() {
    return "Root";
});
app.use('/', root);

var user = cottage();

user.post('/', function*() {
    return "New User"
});

user.get('/:id', function*(req) {
    return "id is " + req.params.id;
});

app.use('/user', user);


describe('Nested Router', function(){
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
            res.assert(404, NOT_FOUND);
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

