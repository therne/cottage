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
        var node = parentNode.letterTable.get(path[base]);
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
                // In the ending comparasion, it substracts param length from given path
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
 * Locate the given path in the tree.
 * @param path that starts with '/'
 */
Tree.prototype.locate = function(path, params) {
    var originalPath = path;
    if (!this.caseSensitive) path = path.toLowerCase();

    var pathLen = path.length;
    if (!this.strictMode && path[pathLen-1] === '/') pathLen--; // skip last slash

    if (this.rootPathLength === pathLen || this.rootPathLength -1 === pathLen) {
        if (this.rootNode.handler) return this.rootNode.handler;
        else return;
    }

    var parentNode = this.rootNode;
    var base = this.rootPathLength; // skip rootPath
    var i, pi, nodePath, nodePathLen, nodePathLenOrig, paramLen, paramIndex;

    while (base < pathLen) {
        var node = parentNode.letterTable.get(path[base]);
        if (!node) {
            if (parentNode.continuingParamChild) {
                node = parentNode.continuingParamChild;
            }
            else if (parentNode.handler && parentNode.handler._cottage /* && is nodepath ended? */) return parentNode.handler;
            else return;
        }

        nodePath = node.path;
        nodePathLen = nodePathLenOrig = node.pathLength;
        paramLen = paramIndex = 0;

        for (pi = 0, i = base; pi < nodePathLenOrig && i < pathLen; pi++) {
            if (path[i] !== nodePath[pi]) {
                // param matching
                if (nodePath[pi] == ':') {
                    var param = '';
                    while (i != pathLen && path[i] !== '/') {
                        param += originalPath[i++];
                        paramLen++;
                    }
                    params[node.paramNames[paramIndex++]] = param;

                    // In the ending comparasion, it substracts param length from given path
                    // and compares with node path length. but one letter (:) is remaining in the node path,
                    // so we should remove it from node path length to match with given path length.
                    nodePathLen--;
                }
                else return;
            }
            else i++;
        }

        if (i === pathLen) {
            // reached the end.
            debugger;
            if (node.handler && i - paramLen === base + nodePathLen) return node.handler;
            else if (node.handler && node.handler._cottage && i - paramLen === base + nodePathLen - 1/* && is nodepath ended? */) return node.handler; // sub-router
            else return; 
        }

        // seems okay now
        parentNode = node;
        base += nodePathLen + paramLen;
    }
    return;
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
}

module.exports = Tree;
