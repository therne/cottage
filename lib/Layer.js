/**
 * Middleware layer.
 * @private
 * @constructor
 */
class Layer {

    constructor(method, path, handler) {
        this.method = method.toUpperCase();
        this.setPath(path);
        this.handler = handler;
    }

    setPath(path) {
        this.path = path;
        this.pathSegments = path.split('/').slice(1);
    }

    match(method, givenPath) {
        if (this.method !== '*' && this.method !== method) return false;
        const splitPath = givenPath.split('/').slice(1);

        for (const i in this.pathSegments) {
            const layerPathSeg = this.pathSegments[i];
            const givenPathSeg = splitPath[i];

            // handle special characters
            if (layerPathSeg[0] === ':') continue;
            if (layerPathSeg === '*') return true;

            if (layerPathSeg !== givenPathSeg) return false;
        }
        return true;
    }
}

module.exports = Layer;
