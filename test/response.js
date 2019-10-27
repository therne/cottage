const { Cottage, Response } = require('..');
const simulate = require('./testutil');

const app = new Cottage();

app.get('/predefined', async () => Response.from('predefined_something'));
app.get('/nothing', async () => new Response(200));
app.get('/statusWithBody', async () => new Response(401, 'Custom Body'));

describe('A Response', function(){

    it('should set response status and body', async () => {
        const { res } = await simulate(app, 'GET', '/statusWithBody');
        res.assert(401, 'Custom Body');
    });

    it('should set response status only', async () => {
        const { res } = await simulate(app, 'GET', '/nothing');
        res.assert(200, '');
    });

    describe('#predefine', function() {
        it('should predefine response with no errors', function() {
            Response.define('predefine_something', 401, {
                code: 'OH_ERROR',
                msg: 'Oh Error Error'
            });
        });

        it('should resolve predefined response', function() {
            const status = Response.from('predefine_something');
            status.status.should.equal(401);
            status.body.code.should.equal('OH_ERROR');
            status.body.msg.should.equal('Oh Error Error');
        });
    })
});
