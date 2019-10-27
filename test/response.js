const { expect } = require('chai');
const { Cottage, Response } = require('..');
const simulate = require('./testutil');

describe('A Response', function () {
    let app;

    beforeEach(() => {
        app = new Cottage();
        app.get('/predefined', async () => Response.from('predefined_something'));
        app.get('/nothing', async () => new Response(200));
        app.get('/statusWithBody', async () => new Response(401, 'Custom Body'));
    });

    it('should set response status and body', async () => {
        const { res } = await simulate(app, 'GET', '/statusWithBody');
        res.assert(401, 'Custom Body');
    });

    it('should set response status only', async () => {
        const { res } = await simulate(app, 'GET', '/nothing');
        res.assert(200, '');
    });

    describe('#predefine', function () {
        it('should predefine response with no errors', function () {
            Response.define('predefine_something', 401, {
                code: 'OH_ERROR',
                msg: 'Oh Error Error',
            });
        });

        it('should resolve predefined response', function () {
            const status = Response.from('predefine_something');
            expect(status.status).to.equal(401);
            expect(status.body.code).to.equal('OH_ERROR');
            expect(status.body.msg).to.equal('Oh Error Error');
        });
    });
});
