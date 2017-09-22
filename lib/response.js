
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
        const pre = Response.statusTable.get(status);
        if (!pre) throw Error("response '" + status + "' is not predefined. (you can use Response.define)");

        return new Response(pre.status, pre.body);
    }

    /**
     * Predefine a response globally.
     * @param {String} name name (key) of the predefined response.
     * @param {Number} status Response HTTP Status.
     * @param {object} body Response body.
     */
    static predefine(key, status, body) {
        if (typeof name === 'object') Response.statusTable = name;
        else if (typeof status !== 'number' || typeof body === 'undefined') {
            throw Error("You need to set status code and response body.");
        }
        else Response.statusTable.set(name, new Response(status, body));
    }
}

Response.statusTable = new Map();

module.exports = Response;