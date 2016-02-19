'use strict';

var util = require('util');

/**
 * Tree node.
 * @param path {String}
 * @param handler {Function}
 */
function Node(path, handler) {
    this.path = path;
    this.letterTable = [];
    if (handler) this.handler = handler;

    // For better performance
    Object.defineProperty(this, 'paramChildNode', { value: undefined, writable: true });
    Object.defineProperty(this, 'pathLength', { value: path.length, writable: true });
}

/**
 * Add child node.
 * @param child {Node}
 */
Node.prototype.addChild = function(child) {
    if (child.path.indexOf(':') != -1) {
        // make child to param node
        child.isParamNode = true;
        this.paramChildNode = child;

        // extract param name (ex: ":name")
        let colonIndex = child.path.indexOf(':');
        let delimiterIndex = child.path.indexOf('/', colonIndex);
        child.paramName = child.path.slice(colonIndex+1,
            delimiterIndex != -1 ? delimiterIndex : child.path.length);

        // has colon or delimiter left? then split it into smaller node.
        if (child.path.lastIndexOf(':') != colonIndex || child.path.indexOf('/') > colonIndex) {
            splitParamNode(child);
        }

        // rest path
        child.path = child.path.slice(0, colonIndex);
    }
    else this.letterTable[child.path.charCodeAt(0) - 32] = child;
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
}

/**
 * Replace oldNode to newNode.
 */
Node.prototype.replaceChild = function(oldNode, newNode) {
    this.letterTable[oldNode.path.charCodeAt(0) - 32] = newNode;

    if (this.paramChildNode) {
        this.paramChildNode = null;
        newNode.paramChildNode = oldNode;
    }
}

/**
 * Branch this node and creates new Node.
 *
 * @param basePoint {Number} New path's basePoint
 * @param branchPointInPath {Number} branch point(index) based on new path
 * @param branchPointInNode {Number} branch point(index) based on this node
 * @param parent {Node}
 * @param newPath {String} new path
 * @param handler {Function} handler function of new path
 */
Node.prototype.branch = function(basePoint, branchPointInPath, branchPointInNode, parent, newPath, handler) {
    var middleNode = new Node(this.path.slice(0, branchPointInNode));
    parent.replaceChild(this, middleNode);

    this.setPath(this.path.substring(branchPointInNode));
    middleNode.addChild(this);
    middleNode.addChild(new Node(newPath.substring(branchPointInPath), handler));
}

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
 */
Node.prototype.branchUpper = function(basePoint, branchPoint, parent, newPath, handler) {
    var newNode = new Node(newPath.substring(basePoint), handler);
    parent.replaceChild(this, newNode);

    this.setPath(this.path.substring(branchPoint));
    newNode.addChild(this);
}

module.exports = Node;