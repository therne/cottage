
const Application = require('./lib/application');
const Response = require('./lib/response');

module.exports = Application;
module.exports.Response = Response;

Object.defineProperty(module.exports, 'Status', {
    get() {
        console.warn('cottage: Warning: Status is deprecated. use cottage.Response instead');
        return Response;
    }
});
