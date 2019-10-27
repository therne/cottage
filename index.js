const Application = require('./lib/Application');
const Response = require('./lib/Response');

class LegacyCottageModule extends Application {
    constructor(...args) {
        super(...args);
        console.warn('cottage: Warning: importing cottage as a default import is deprecated.');
        console.warn("         Please use `const { Cottage } = require('cottage')` instead.");
    }
}

LegacyCottageModule.Cottage = Application;
LegacyCottageModule.Response = Response;

Object.defineProperty(LegacyCottageModule, 'Status', {
    get() {
        console.warn('cottage: Warning: Status is deprecated. use cottage.Response instead');
        return Response;
    }
});

module.exports = LegacyCottageModule;
