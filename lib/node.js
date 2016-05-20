'use strict';

var util = require('util');
var Path = require('path');

/**
 * Tree node.
 * @param path {String}
 * @param handler {Function}
 */
function Node(path, handler) {
    this.path = path;
    this.letterTable = [];

    // For better performance
    Object.defineProperty(this, 'paramChildNode', { value: undefined, enumerable: true, writable: true });
    Object.defineProperty(this, 'pathLength', { value: path.length, enumerable: true, writable: true });

    if (handler instanceof Node) this.override(handler);
    else if (handler) this.handler = handler;
}

/**
 * Add child node.
 * @param child {Node}
 */
Node.prototype.addChild = function(child) {
    let colonIndex = child.path.indexOf(':');
    if (colonIndex != -1) {
        makeParamNode(child);

        if (colonIndex == 0) this.paramChildNode = child;
        else this.letterTable[child.path.charCodeAt(0) - 32] = child;
    }
    else this.letterTable[child.path.charCodeAt(0) - 32] = child;
    child.parent = this;
    this.childCount = this.childCount + 1 || 1;
};

function makeParamNode(node) {
    if (node.isParamNode) return;

    // make child to param node
    node.isParamNode = true;

    // extract param name (ex: ":name")
    let colonIndex = node.path.indexOf(':');
    let delimiterIndex = node.path.indexOf('/', colonIndex);
    node.paramName = node.path.slice(colonIndex + 1,
        delimiterIndex != -1 ? delimiterIndex : node.path.length);

    // has colon or delimiter left? then split it into smaller node.
    if (node.path.lastIndexOf(':') != colonIndex || node.path.lastIndexOf('/') > colonIndex) {
        splitParamNode(node);
    }

    // rest path
    node.setPath(node.path.slice(0, colonIndex));
}

/**
 * Merge node.
 * @param node {Node}
 */
Node.prototype.merge = function(node) {
    if (!this.parent) {
        this.setPath(Path.join(this.path, node.path));
        if (node.path.indexOf(':') != -1) makeParamNode(node);
        return;
    }
    let newNode = new Node(Path.join(this.path, node.path));
    this.parent.replaceChild(this, newNode);
};

function splitParamNode(node) {
    for (let i=node.path.indexOf(':') + 1; i<node.pathLength; i++) {
        if (node.path[i] === '/' || node.path[i] === ':') {
            const splitNode = new Node(node.path.slice(i));
            if (node.handler) {
                splitNode.handler = node.handler;
                node.handler = null;
            }
            node.setPath(node.path.slice(0, i));
            node.addChild(splitNode);
            return;
        }
    }
}

Node.prototype.setPath = function(path) {
    this.path = path;
    this.pathLength = path.length;
};

/**
 * Replace oldNode to newNode.
 */
Node.prototype.replaceChild = function(oldNode, newNode) {
    this.letterTable[oldNode.path.charCodeAt(0) - 32] = newNode;

    if (this.paramChildNode) {
        this.paramChildNode = null;
        newNode.paramChildNode = oldNode;
    }
    newNode.parent = this;
};

/**
 * Branch this node and creates new Node.
 *
 * @param basePoint {Number} New path's basePoint
 * @param branchPointInPath {Number} branch point(index) based on new path
 * @param branchPointInNode {Number} branch point(index) based on this node
 * @param parent {Node}
 * @param newPath {String} new path
 * @param handler {Function} handler function of new path
 * @returns {Node} created node
 */
Node.prototype.branch = function(basePoint, branchPointInPath, branchPointInNode, parent, newPath, handler) {
    var newNode = new Node(newPath.substring(branchPointInPath), handler);
    var middleNode = new Node(this.path.slice(0, branchPointInNode));
    parent.replaceChild(this, middleNode);

    this.setPath(this.path.substring(branchPointInNode));
    middleNode.addChild(this);
    middleNode.addChild(newNode);
    return newNode;
};

/**
 * Branch new node and attach this node to it.
 *
 * The newer path is overlapping with this node - but it's shorter.
 * so cut this path and attach it to the new path node.
 *
 * @param basePoint {Number} New path's basePoint
 * @param branchPoint {Number} branch point(index) based on this node
 * @param parent {Node}
 * @param newPath {String} new path
 * @param handler {Function} handler function of new path
 * @returns {Node} created node
 */
Node.prototype.branchUpper = function(basePoint, branchPoint, parent, newPath, handler) {
    var newNode = new Node(newPath.substring(basePoint), handler);
    parent.replaceChild(this, newNode);

    this.setPath(this.path.substring(branchPoint));
    newNode.addChild(this);
    return newNode;
};

/**
 * Override a information of node.
 * @param node {Node}
 */
Node.prototype.override = function(node) {
    for (var key in node) {
        if (node.hasOwnProperty(key) && key !== 'path' && key !== 'pathLength') {
            this[key] = node[key];
        }
    }
};

module.exports = Node;