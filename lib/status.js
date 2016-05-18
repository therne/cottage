/**
 * @param {Number} status Response HTTP Status.
 * @param {object} body Response body.
 */
function Status(status, body) {
    if (!(this instanceof Status)) return new Status(status, body);

    // Pick from predefined status table
    if (typeof status === 'string') {
        var pre = Status.statusTable.get(status);
        if (!pre) throw Error("status '" + status + "' is not predefined. (you can use Status.predefine)");
        this.status = pre.status;
        this.body = pre.body;
        return;
    }

    this.status = status;
    this.body = body ? body : '';
}

Status.statusTable = new Map();

/**
 * Predefine a response globally.
 * @param {String} name name (key) of the predefined response.
 * @param {Number} status Response HTTP Status.
 * @param {object} body Response body.
 */
Status.predefine = function(name, status, body) {
    if (typeof name === 'object') Status.statusTable = name;
    else if (typeof status !== 'number' || typeof body === 'undefined') {
        throw Error("You need to set status code and response body.");
    }
    else Status.statusTable.set(name, new Status(status, body));
}

module.exports = Status;