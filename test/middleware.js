
var cottage = require('..');
var simulate = require('./testutil');

// Router
var app = cottage();

app.use(function* testStart(next) {
    this.test = true;
    yield next;
});

app.get('/passing', function*() {
    return 'The value is ' + this.test;
})
app.use(function* firstLast(next) {
    this.body = '1';
    yield next;
    // modifying this.body on here causes status to set 200 always.
    this.response.res.body += 'L'; 
})

app.use(function* second(next) {
    this.body += '2';
    yield next;
});

app.get('/afterSecond', function*(req, res) {
    res.body += 'x';
});

app.use(function* third(next) {
    this.body += '3';
    yield next;
});

app.get('/afterThird', function*(req, res) {
    res.body += 'x';
});

app.use(function* fourth(next) {
    this.body += '4';
    yield next;
});

app.get('/afterFourth', function*(req, res) {
    res.body += 'x';
});

app.use(function* noMatch(next) {
    this.body += 'N';
    this.status = 404;
});

// Yet another router
var yapp = cottage();
yapp.get('/',
    function* md1(next) {
        this.body = '1';
        yield next;
    },
    function* md2(next) {
        this.body += '2';
        yield next;
    },
    function* md3(next) {
        this.body += '3';
        yield next;
    },
    function* md4(next) {
        this.body += '4';
        yield next;
    },
    function* handle(req, res) {
        res.body += 'x';
    }
);

// Test 
describe('Middleware', function(){
    it('should pass context.test=true value to the route', function(done){
        simulate(app, done, 'GET', '/passing', function(res) {
            res.assert(200, 'The value is true');
            done();
        });
    });


    it('should matched 12xL order with GET /afterSecond', function(done){
        simulate(app, done, 'GET', '/afterSecond', function(res) {
            res.assert(200, '12xL');
            done();
        });
    });

    it('should matched 123xL order with GET /afterThird', function(done){
        simulate(app, done, 'GET', '/afterThird', function(res) {
            res.assert(200, '123xL');
            done();
        });
    });

    it('should matched 1234xL order with GET /afterFourth', function(done){
        simulate(app, done, 'GET', '/afterFourth', function(res) {
            res.assert(200, '1234xL');
            done();
        });
    });

    it('should matched 1234NL order with GET /nowhere', function(done){
        simulate(app, done, 'GET', '/nowhere', function(res) {
            res.assert(404, '1234NL');
            done();
        });
    });

    it('should matched 1234x order with multiple handler', function(done){
        simulate(yapp, done, 'GET', '/', function(res) {
            res.assert(200, '1234x');
            done();
        });
    });
})
