
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


var middleApp = cottage();
middleApp.use(function*(next) {
    this.body += "M3 ";
    yield next;
});

middleApp.use(function*(next) {
    this.body += "M4 ";
    yield next;
});

middleApp.get('/middle/ware', function*() {
    this.body += 'E';
});

app.use(function*(next) {
    this.body = 'M1 ';
    yield next;
});

app.use(function*(next) {
    this.body += 'M2 ';
    yield next;
});

app.use('/middletest/', middleApp);

describe('Nested Router', function(){
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

    it('can return 404 Error', function(done){
        let noapp = cottage();
        let noappSub = cottage();
        noapp.setNotFoundHandler(function*(next) {
            this.response.res.body = 'nowhere man';
            yield *next;
        });
        noapp.use('/nowhere', noappSub);
        simulate(noapp, done, 'GET', '/nahe', function(res) {
            res.assert(404, 'nowhere man');
            done();
        });
    });

    it('should map parameter ', function(done){
        simulate(app, done, 'GET', '/user/retail3210', function(res) {
            res.assert(200, 'id is retail3210');
            done();
        });
    });

    it('should execute middlewares', function(done) {
        simulate(app, done, 'GET', '/middletest/middle/ware', function(res) {
            res.assert(200, 'M1 M2 M3 M4 E');
            done();
        });
    });
})
