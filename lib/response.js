/**
 * @param {Number} status HTTP Status.
 * @param {object} body body.
 */
function Response(status, body) {
    if (!(this instanceof Response)) return new Response(status, body);

    // Pick from predefined status table
    if (typeof status === 'string') {
        var pre = Response.statusTable.get(status);
        if (!pre) throw Error("response '" + status + "' is not predefined. (you can use Response.predefine)");
        this.status = pre.status;
        this.body = pre.body;
        return;
    }

    this.status = status;
    this.body = body ? body : '';
}

Response.statusTable = new Map();

/**
 * Predefine a response globally.
 * @param {String} name name (key) of the predefined response.
 * @param {Number} status Response HTTP Status.
 * @param {object} body Response body.
 */
Response.predefine = function(name, status, body) {
    if (typeof name === 'object') Response.statusTable = name;
    else if (typeof status !== 'number' || typeof body === 'undefined') {
        throw Error("You need to set status code and response body.");
    }
    else Response.statusTable.set(name, new Response(status, body));
};

module.exports = Response;