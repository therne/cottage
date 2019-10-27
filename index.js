const Application = require('./lib/Application');
const Response = require('./lib/Response');

module.exports = Application;
module.exports.Response = Response;

Object.defineProperty(module.exports, 'Status', {
    get() {
        console.warn('cottage: Warning: Status is deprecated. use cottage.Response instead');
        return Response;
    }
});
