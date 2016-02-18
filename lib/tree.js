'use strict';

var Node = require('./node');
var util = require('util');

function Tree(options) {
    options = options || {};

    this.rootPath = options.rootPath || '/';
    this.rootNode = new Node(this.rootPath);
    this.rootPathLength = this.rootNode.path.length;
    this.strictMode = options.strictMode || false;
    this.caseSensitive = options.caseSensitive || false;
}

/**
 * Add a new route to the tree.
 */
Tree.prototype.add = function(path, handler) {
    if (path === this.rootPath) {
        this.rootNode.handler = handler;
        return;
    }

    var parentNode = this.rootNode;
    var pathLen = path.length, base = this.rootPathLength; // skip rootPath

    while (base < pathLen) {
        var node = parentNode.letterTable[path.charCodeAt(base) - 32];
        if (!node) {
            if (parentNode.continuingParamChild) {
                node = parentNode.continuingParamChild;
            }
            else return parentNode.addChild(new Node(path.substring(base), handler));
        }

        var nodePathLen = node.path.length,
            currPathLen = pathLen - base,
            paramLen = 0,
            min = Math.min(nodePathLen, currPathLen), i, pi;

        for (pi = 1, i = base+1; pi < node.path.length && i < pathLen; pi++) {
            // branch
            if (path[i] != node.path[pi])
                return node.branch(base, i, pi, parentNode, path, handler);

            // skip the param name
            if (path[i] === ':') {
                while (i != pathLen && path[i] !== '/') {
                    i++;
                    paramLen++;
                }
                // In the ending comparison, it subtracts param length from given path
                // and compares with node path length. but one letter (:) is remaining in the node path,
                // so we should remove it from node path length to match with given path length.
                nodePathLen--;
            }
            else i++;
        }

        // reached at the end
        if (i == pathLen) {
            // more characters are left - branch it
            if (currPathLen - paramLen < nodePathLen) {
                return node.branchUpper(base, pi, parentNode, path, handler);
            }

            else if (currPathLen - paramLen == nodePathLen) {
                if (node.handler) {
                    // TODO: handle duplicated node
                    throw new Error("duplicated path : " + path);
                }
                else {
                    node.handler = handler;
                    return node;
                }
            }
        }

        // seems okay now
        parentNode = node;
        base += nodePathLen + paramLen;
        // if (parentNode.paramName) base += 1;
    }

    // cannot possible
    throw new Error("something had been wrong");
}

/**
 * Locate the handler matches with given path in the tree.
 * @param path that starts with '/'
 * @param params {Object}
 */
Tree.prototype.locate = function(path, params) {
    // case insensitive mode
    var originalPath = path;
    if (!this.caseSensitive) path = path.toLowerCase();
    if (path === this.rootPath) return this.rootNode.handler;

    let depth = 0;
    let pathLen = path.length;
    let node = this.rootNode;

    let nodePath, nodePathLen, i;
    let paramLenSum = 0, nodeLenSum = 0, paramIndex;

    // skip last slash when strict mode
    if (!this.strictMode && path[pathLen-1] === '/') pathLen--;

    while (depth < pathLen) {
        if (!node) return null;

        // let's check prefix matches
        nodePath = node.path;
        nodePathLen = node.pathLength;
        paramIndex = 0;

        for (i = 0; i < nodePathLen && depth < pathLen; i++) {
            if (path[depth] !== nodePath[i]) {
                // param matching
                if (nodePath[i] == ':') {
                    let endIndex = path.indexOf('/', depth);
                    if (endIndex < 0) endIndex = pathLen;
                    params[node.paramNames[paramIndex++]] = originalPath.slice(depth, endIndex);

                    paramLenSum = paramLenSum + (endIndex - depth);
                    depth = endIndex;

                    // In the ending comparison, it subtracts param length from given path
                    // and compares with node path length. but one letter (:) is remaining in the node path,
                    // so we should remove it from node path length to match with given path length.
                    nodeLenSum--;
                }
                else return;
            }
            else depth++;
        }
        nodeLenSum += nodePathLen;

        if (depth === pathLen) {
            // reached at the end of given path.
            if (node.handler && depth - paramLenSum === nodeLenSum) return node.handler;
            else return null;
        }

        node = node.letterTable[path.charCodeAt(depth) - 32] || node.continuingParamChild;
    }
    return null;
};

/**
 * Changes rootNode Path. (default is '/')
 */
Tree.prototype.setRootPath = function(path) {
    this.rootNode.setPath(path);
    this.rootPath = path;
    this.rootPathLength = path.length;
}

/**
 * For debug purpose.
 */
Tree.prototype.visualize = function() {
    console.log(util.inspect(this.rootNode, false, 30, true));
};

Tree.prototype.export = function() {
    return (function _export(node) {
        var data = {
            path: node.path,
            children: []
        };
        node.letterTable.forEach(function(child) {
            data.children.push(_export(child));
        });
        return data;
    })(this.rootNode);
};

module.exports = Tree;
