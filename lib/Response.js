class Response {
    static predefinedResponses = new Map();

    /**
     * @param {Number} status HTTP Status.
     * @param {object} body body.
     */
    constructor(status, body = '') {
        this.status = status;
        this.body = body;
    }

    static from(key) {
        // Pick from predefined status table
        const pre = Response.predefinedResponses.get(key);
        if (!pre) throw new Error(`response ${name} is not predefined. (you can use Response.define)`);

        return new Response(pre.status, pre.body);
    }

    /**
     * Predefine a response globally.
     * @param {String} key key of the predefined response.
     * @param {Number} status Response HTTP Status.
     * @param {object} body Response body.
     */
    static define(key, status, body) {
        if (typeof key === 'object') {
            const kvPair = Object.keys(key).map(k => [k, key[k]]);
            Response.predefinedResponses = new Map(kvPair);
            return;

        } else if (typeof status !== 'number' || typeof body === 'undefined') {
            throw Error("You need to set status code and response body.");
        }
        Response.predefinedResponses.set(key, new Response(status, body));
    }
}

module.exports = Response;
