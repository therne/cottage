
const Cottage = require('..');
const simulate = require('./testutil');


const root = new Cottage();
root.get('/', async () => 'Root');

const user = new Cottage();
user.post('/', async () => 'New User');
user.get('/:id', async ({ request }) => `id is ${request.params.id}`);

// build large test app
const app = new Cottage();
app.use('/', root);
app.use('/user', user);


const middleApp = new Cottage();
middleApp.use(async (ctx, next) => {
    ctx.body += "M3 ";
    await next();
});

middleApp.use(async (ctx, next) => {
    ctx.body += "M4 ";
    await next();
});

middleApp.get('/middle/ware', async () => {
    ctx.body += 'E';
});

app.use(async (ctx, next) => {
    ctx.body = 'M1 ';
    await next();
});

app.use(async (ctx, next) => {
    ctx.body += 'M2 ';
    await next();
});

app.use('/middletest/', middleApp);

describe('Nested Router', function(){
    it('should route root path', async () => {
        const { res } = await simulate(app, 'GET', '/');
        res.assert(200, 'Root');
    });

    it('should route nested path', async () => {
        const { res } = await simulate(app, 'POST', '/user');
        res.assert(200, 'New User');
    });

    it('can return 404 Error', async () => {
        const noapp = new Cottage();
        const noappSub = new Cottage();
        noapp.setNotFoundHandler(async (ctx, next) => {
            ctx.response.res.body = 'nowhere man';
            await next();
        });
        noapp.use('/nowhere', noappSub);

        const { res } = await simulate(app, 'GET', '/nahe');
        res.assert(404, 'nowhere man');
    });

    it('should map parameter ', async () => {
        const { res } = await simulate(app, 'GET', '/user/retail3210');
        res.assert(200, 'id is retail3210');
    });

    it('should execute middlewares', async () =>  {
        const { res } = await simulate(app, 'GET', '/middletest/middle/ware');
        res.assert(200, 'M1 M2 M3 M4 E');
    });
});
