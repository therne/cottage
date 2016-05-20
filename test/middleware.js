
var cottage = require('..');
var simulate = require('./testutil');

// match order test
var orderApp = cottage();

orderApp.use(function* firstLast(next) {
    this.body = '1';
    yield next;
    // modifying this.body on here causes status to set 200 always.
    this.response.res.body += 'L'; 
})

orderApp.use(function* second(next) {
    this.body += '2';
    yield next;
});

orderApp.get('/afterSecond', function*(req, res) {
    res.body += 'x';
});

orderApp.use(function* third(next) {
    this.body += '3';
    yield next;
});

orderApp.get('/afterThird', function*(req, res) {
    res.body += 'x';
});

orderApp.use(function* fourth(next) {
    this.body += '4';
    yield next;
});

orderApp.get('/afterFourth', function*(req, res) {
    res.body += 'x';
});

orderApp.use(function* noMatch(next) {
    this.body += 'N';
    this.status = 404;
});


// Test 
describe('Middleware', function(){
    it('should share same context with handler', function(done){
        var app = cottage();
        app.use(function* testStart(next) {
            this.test = true;
            yield next;
        });
        app.get('/passing', function*() {
            return 'The value is ' + this.test;
        });
        simulate(app, done, 'GET', '/passing', function(res) {
            res.assert(200, 'The value is true');
            done();
        });
    });


    it('should matched with correct order (1)', function(done){
        simulate(orderApp, done, 'GET', '/afterSecond', function(res) {
            res.assert(200, '12xL');
            done();
        });
    });

    it('should matched with correct order (2)', function(done){
        simulate(orderApp, done, 'GET', '/afterThird', function(res) {
            res.assert(200, '123xL');
            done();
        });
    });

    it('should matched with correct order (3)', function(done){
        simulate(orderApp, done, 'GET', '/afterFourth', function(res) {
            res.assert(200, '1234xL');
            done();
        });
    });

    it('should matched despite 404 error', function(done){
        simulate(orderApp, done, 'GET', '/nowhere', function(res) {
            res.assert(404, '1234NL');
            done();
        });
    });

    it("as multiple handler should matched with correct order", function(done){
        var mapp = cottage();
        mapp.get('/',
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

        simulate(mapp, done, 'GET', '/', function(res) {
            res.assert(200, '1234x');
            done();
        });
    });
})
