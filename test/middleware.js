
const Cottage = require('..');
const simulate = require('./testutil');

// match order test
const orderApp = new Cottage();

orderApp.use(async function firstLast(ctx, next) {
    ctx.body = '1';
    await next();

    if (ctx.status === 404) {
        ctx.body += 'L';
        ctx.status = 404;
    } else {
        ctx.body += 'L';
    }
});

orderApp.use(async function second(ctx, next) {
    ctx.body += '2';
    await next();
});

orderApp.get('/afterSecond', async function(ctx) {
    ctx.body += 'x';
});

orderApp.use(async function third(ctx, next) {
    ctx.body += '3';
    await next();
});

orderApp.get('/afterThird', async function(ctx) {
    ctx.body += 'x';
});

orderApp.use(async function fourth(ctx, next) {
    ctx.body += '4';
    await next();
});

orderApp.get('/afterFourth', async function(ctx) {
    ctx.body += 'x';
});

orderApp.use(async function noMatch(ctx, next) {
    ctx.body += 'N';
    ctx.status = 404;
});


// Test
describe('A Middleware', function(){
    it('should share same context with handler', async () => {
        const app = new Cottage();
        app.use(async function testStart(ctx, next) {
            ctx.test = true;
            await next();
        });
        app.get('/passing', async function(ctx) {
            return 'The value is ' + ctx.test;
        });

        const { res } = await simulate(app, 'GET', '/passing');
        res.assert(200, 'The value is true');
    });


    it('should matched with correct order (1)', async () => {
        const { res } = await simulate(orderApp, 'GET', '/afterSecond');
        res.assert(200, '12xL');
    });

    it('should matched with correct order (2)', async () => {
        const { res } = await simulate(orderApp, 'GET', '/afterThird');
        res.assert(200, '123xL');
    });

    it('should matched with correct order (3)', async () => {
        const { res } = await simulate(orderApp, 'GET', '/afterFourth');
        res.assert(200, '1234xL');
    });

    it('should matched despite 404 error', async () => {
        const { res } = await simulate(orderApp, 'GET', '/nowhere');
        res.assert(404, '1234NL');
    });

    it('should strip path prefix for "mounted" middleware', async () => {
        const prefApp = new Cottage();
        prefApp.use('/some/', async function(ctx, next) {
            ctx.body = ctx.path;
            await next();
        });
        prefApp.get('/some/path', async function(ctx) {
            ctx.body += ' ' + ctx.path;
        });

        const { res } = await simulate(prefApp, 'GET', '/some/path');
        res.assert(200, '/path /some/path');
    });

    it("as multiple handler should matched with correct order", async () => {
        const mapp = new Cottage();
        mapp.get('/',
            async function md1(ctx, next) {
                ctx.body = '1';
                await next();
            },
            async function md2(ctx, next) {
                ctx.body += '2';
                await next();
            },
            async function md3(ctx, next) {
                ctx.body += '3';
                await next();
            },
            async function md4(ctx, next) {
                ctx.body += '4';
                await next();
            },
            async function handle(ctx) {
                ctx.body += 'x';
            }
        );

        const { res } = await simulate(mapp, 'GET', '/');
        res.assert(200, '1234x');
    });
});
