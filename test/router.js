
const Cottage = require('..');
const simulate = require('./testutil');

const app = new Cottage();
const NOT_FOUND = 'Not Found';

app.get('/', async () => "Root");
app.post('/user', async () => "New User");
app.get('/user/:id', async ({request}) => `id is ${request.params.id}`);
app.get('/user/:id/:id2/:id3/:id4', async ({request}) =>
    `${request.params.id} ${request.params.id2} ${request.params.id3} ${request.params.id4}`);

describe('A Router', function(){
    it('should route root path', async () => {
        const { res } = await simulate(app, 'GET', '/');
        res.assert(200, 'Root');
    });

    it('should route nested path', async () => {
        const { res } = await simulate(app, 'POST', '/user');
        res.assert(200, 'New User');
    });

    it('can return 404 error', async () => {
        const { res } = await simulate(app, 'GET', '/nowhere');
        res.assert(404, NOT_FOUND);
    });

    it('can handle error', async () => {
        const errApp = new Cottage();
        errApp.use(async (ctx, next) => {
            try {
                await next();
            } catch (err) {
                ctx.status = 500;
                ctx.body = 'Error';
            }
        });
        errApp.get('/', async () => { throw Error(); });

        const { res } = await simulate(errApp, 'GET', '/');
        res.assert(500, 'Error');
    });

    it('can define route with route()', async () => {
        const rouApp = new Cottage();
        rouApp.route('/hello')
            .use(async (ctx, next) => {
                ctx.body = 'Mid ';
                await next();
            })
            .get(async (ctx) => {
                ctx.body += 'Hi~';
            });

        const { res } = await simulate(rouApp, 'GET', '/hello');
        res.assert(200, 'Mid Hi~');
    });


    it('can have duplicated handler', async () => {
        const app = new Cottage();

        app.get('/duplicated', async (ctx, next) => {
            ctx.body = 'First ';
            await next();
        });

        app.get('/duplicated', async (ctx) => {
            ctx.body += 'Second';
        });

        const { res } = await simulate(app, 'GET', '/duplicated');
        res.assert(200, 'First Second');
    });

    it('should map parameter', async () => {
        const { res } = await simulate(app, 'GET', '/user/retail3210');
        res.assert(200, 'id is retail3210');
    });

    it('should map multiple parameter ', async () => {
        const { res } = await simulate(app, 'GET', '/user/a/bcd/ef/g');
        res.assert(200, 'a bcd ef g');
    });
});
