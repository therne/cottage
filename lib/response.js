
class Response {

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
        const pre = Response.statusTable.get(key);
        if (!pre) throw Error("response '" + key + "' is not predefined. (you can use Response.define)");

        return new Response(pre.status, pre.body);
    }

    /**
     * Predefine a response globally.
     * @param {String} key key of the predefined response.
     * @param {Number} status Response HTTP Status.
     * @param {object} body Response body.
     */
    static predefine(key, status, body) {
        if (typeof key === 'object') Response.statusTable = key;
        else if (typeof status !== 'number' || typeof body === 'undefined') {
            throw Error("You need to set status code and response body.");
        }
        Response.statusTable.set(key, new Response(status, body));
    }
}

Response.statusTable = new Map();

module.exports = Response;