const Application = require('./lib/Application');
const Response = require('./lib/Response');

class LegacyCottage extends Application {
    static Cottage = Application;
    static Response = Response;

    constructor(...args) {
        super(...args);
        console.warn('cottage: Warning: importing cottage as a default import is deprecated.');
        console.warn("         Please use `const { Cottage } = require('cottage')` instead.");
    }
}

Object.defineProperty(LegacyCottage, 'Status', {
    get() {
        console.warn('cottage: Warning: Status is deprecated. use cottage.Response instead');
        return Response;
    }
});

module.exports = LegacyCottage;
