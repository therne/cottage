'use strict';

var Node = require('./node');
var Path = require('path');
var util = require('util');

function Tree(options) {
    options = options || {};

    this.rootPath = options.rootPath || '/';
    this.rootNode = new Node(this.rootPath);
    this.leafNodes = {};
    this.rootPathLength = this.rootNode.path.length;
    this.strictMode = options.strictMode || false;
    this.caseSensitive = options.caseSensitive || false;
}

/**
 * Add a new route to the tree.
 */
Tree.prototype.add = function(path, handler) {
    if (path === this.rootPath) {
        if (handler instanceof Node) this.rootNode.override(handler);
        else this.rootNode.handler = handler;
        this.leafNodes[path] = this.rootNode;
        return this.rootNode;
    }

    var parentNode = this.rootNode;
    var pathLen = path.length, depth = this.rootPathLength; // skip rootPath

    while (depth < pathLen) {
        let node = parentNode.letterTable[path.charCodeAt(depth) - 32]
                || parentNode.paramChildNode;
        if (!node) {
            //if (!parentNode.childCount && !parentNode.handler) {
            //    // path comprehension - merge child node into parent node
            //    parentNode.merge(new Node(path, handler));
            //    if (parentNode == this.rootNode) {
            //        this.setRootPath(parentNode.path);
            //    }
            //    return parentNode;
            //}
            let newNode = new Node(path.substring(depth), handler);
            parentNode.addChild(newNode);
            this.leafNodes[path] = newNode;
            return newNode;
        }

        let nodePathLen = node.path.length,
            currPathLen = pathLen - depth,
            paramLen = 0, i, pi;

        for (pi = 1, i = depth+1; pi < node.path.length && i < pathLen; pi++) {
            // branch
            if (path[i] != node.path[pi]) {
                let newNode = node.branch(depth, i, pi, parentNode, path, handler);
                this.leafNodes[path] = newNode;
                return newNode;
            }
            else i++;
        }
        if (node.isParamNode) {
            let endIndex = path.indexOf('/', i);
            if (endIndex < 0) endIndex = pathLen;
            paramLen += (endIndex - i);
            i = endIndex;
        }

        // reached at the end
        if (i == pathLen) {
            // more characters are left - branch it
            if (currPathLen - paramLen < nodePathLen) {
                let newNode = node.branchUpper(depth, pi, parentNode, path, handler);
                this.leafNodes[path] = newNode;
                return newNode;
            }

            else if (currPathLen - paramLen == nodePathLen) {
                if (node.handler) {
                    if (handler instanceof Node && !handler.handler) {
                        handler.handler = node.handler;
                        node.override(handler);
                        return node;
                    }
                    // TODO: handle duplicated node
                    throw new Error("duplicated path : " + path);
                }
                else {
                    if (handler instanceof Node) node.override(handler);
                    else node.handler = handler;
                    this.leafNodes[path] = node;
                    return node;
                }
            }
        }

        // seems okay now
        parentNode = node;
        depth = i;
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
    const originalPath = path;
    if (!this.caseSensitive) path = path.toLowerCase();

    if (path === this.rootPath) return this.rootNode;

    let depth = 0, pathLen = path.length;
    let paramLenSum = 0, nodeLenSum = 0;
    let node = this.rootNode;

    // skip last slash when strict mode
    if (!this.strictMode && path[pathLen-1] === '/') pathLen--;

    while (depth < pathLen) {
        // let's check prefix
        if (path.indexOf(node.path, depth) !== depth) return null;
        depth += node.pathLength;

        if (node.isParamNode) {
            let endIndex = path.indexOf('/', depth);
            if (endIndex < 0) endIndex = pathLen;
            if (depth >= endIndex) return null;
            params[node.paramName] = originalPath.slice(depth, endIndex);

            paramLenSum += (endIndex - depth);
            depth += (endIndex - depth);
        }
        nodeLenSum += node.pathLength;

        // has reached at the end of given path?
        if (depth === pathLen) {
            if (node.handler && depth - paramLenSum === nodeLenSum) return node;
            else return null;
        }

        // go deeper
        node = node.letterTable[path.charCodeAt(depth) - 32] || node.paramChildNode;
        if (!node) return null;
    }
    return null;
};

/**
 * Mount and merge a tree onto the given path.
 * @param path {String}
 * @param tree {Tree}
 */
Tree.prototype.merge = function(path, tree) {
    if (tree.caseSensitive != this.caseSensitive || tree.strictMode != this.strictMode) {
        console.warn("cottage: warn: path routing option of child router (strict mode, case sensitive... ) " +
            "is different to the parent's. Ignoring...");
    }
    let newNode = this.add(path, tree.rootNode);
    if (newNode.paramChildNode) {
        newNode.paramChildNode.setPath(newNode.paramChildNode.path + '/');
    } else if (newNode.path[newNode.pathLength - 1] !== '/' && newNode.childCount > 0) {
        let slashNode = new Node('/');

        // transfer children of new node to the slash(/) node
        slashNode.letterTable = newNode.letterTable;
        slashNode.childCount = newNode.childCount;
        newNode.letterTable = [];
        newNode.childCount = 0;

        // and attach slash to new node
        newNode.addChild(slashNode);
    }
};

/**
 * Traverse each node which has a handler.
 * @param callback {Function}
 */
Tree.prototype.traverse = function(callback) {
    for (var path in this.leafNodes) callback(path, this.leafNodes[path]);
};

/**
 * @returns {Tree} A copy of the tree.
 */
Tree.prototype.clone = function() {
    let clone = new Tree({
        rootPath: this.rootPath,
        strictMode: this.strictMode,
        caseSensitive: this.caseSensitive
    });
    let tree = this;
    clone.rootNode = cloneNode(this.rootNode);

    function cloneNode(node, path) {
        if (!path) path = tree.rootPath;
        var copyNode = new Node(node.path);
        copyNode.override(node);

        // fill leafNodes info
        if (copyNode.handler) clone.leafNodes[path] = copyNode;

        // clone children
        node.letterTable.forEach(function(child) {
            if (child != null) copyNode.addChild(cloneNode(child, path + child.path));
        });
        if (node.paramChildNode) {
            copyNode.paramChildNode = cloneNode(node.paramChildNode, path + node.paramChildNode.path);
        }
        return copyNode;
    }
    return clone;
};

/**
 * Changes rootNode Path. (default is '/')
 */
Tree.prototype.setRootPath = function(path) {
    this.rootNode.setPath(path);
    this.rootPath = path;
    this.rootPathLength = path.length;

    // update leafNodes info
    let oldPaths = Object.keys(this.leafNodes);
    if (oldPaths.length > 0) {
        let newLeafNodes = {};
        let self = this;
        oldPaths.forEach(function(oldPath) {
            newLeafNodes[Path.join(path, oldPath)] = self.leafNodes[oldPath];
        });
        this.leafNodes = newLeafNodes;
    }
}

/**
 * For debug purpose.
 */
Tree.prototype.visualize = function() {
    console.log(util.inspect(this.export(), false, 30, true));
};

Tree.prototype.export = function() {
    return (function _export(node) {
        var data = {
            path: node.path,
            children: []
        };
        if (node.isParamNode) data.paramName = node.paramName;
        node.letterTable.forEach(function(child) {
            if (child != null) data.children.push(_export(child));
        });
        if (node.paramChildNode) {
            data.paramChildNode = _export(node.paramChildNode);
        }
        return data;
    })(this.rootNode);
};

module.exports = Tree;
