
function Status(status, msg) {
    if (!(this instanceof Status)) return new Status(status, msg);

    // Pick from predefined status table
    if (typeof status === 'string') {
        status = Status.statusTable[status];
        for (var key in status) this[key] = status[key];
        return;
    }

    this.status = status;
    this.msg = msg ? msg : '';
}

Status.statusTable = {};

/**
 * Predefines the response globally.
 * @param {String} name Status name (code)
 * @param {object} status Response
 */
Status.predefine = function(name, status) {
    if (typeof name === 'object') Status.statusTable = name;
    else Status.statusTable[name] = status;
}

Status.format = function(callback) {
    Status.formatCallback = callback;
}

Status.formatCallback = function defaultFormatter(status) {
    if (!status.msg) return '';

    var ret = {};
    for (var key in status) if (key !== 'status') ret[key] = status[key];
    return ret;
}

module.exports = Status;