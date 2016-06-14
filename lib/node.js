'use strict';

const util = require('util');
const Path = require('path');

/**
 * Tree node.
 * @constructor
 * @private
 */
function Node(path) {
    this.path = path;
    this.letterTable = [];
    this.pathLength = path.length;
    this.handlers = {};
}

/**
 * Add child node.
 * @param {Node} child
 */
Node.prototype.addChild = function(child) {
    let leafChild = child;
    let colonIndex = child.path.indexOf(':');
    if (colonIndex != -1) {
        leafChild = makeParamNode(child);

        if (colonIndex == 0) this.paramChildNode = child;
        else this.letterTable[child.path.charCodeAt(0) - 32] = child;
    }
    else this.letterTable[child.path.charCodeAt(0) - 32] = child;
    child.parent = this;
    this.childCount = this.childCount + 1 || 1;
    return leafChild;
};

Node.prototype.setHandler = function(method, handler) {
    this.handlers[method] = handler;
};

Node.prototype.getHandler = function(method) {
    return this.handlers[method];
};

Node.prototype.hasHandler = Node.prototype.getHandler;

/**
 * Add lazy node handler (composed middleware).
 * @param {GeneratorFunction} middleware
 */
Node.prototype.setLazyHandler = function(middleware) {
    this.lazyHandler = middleware;
    this.isLazyNode = true;
};

function makeParamNode(node) {
    if (node.isParamNode) return;
    let leafChild = node;

    // make child to param node
    node.isParamNode = true;

    // extract param name (ex: ":name")
    let colonIndex = node.path.indexOf(':');
    let delimiterIndex = node.path.indexOf('/', colonIndex);
    node.paramName = node.path.slice(colonIndex + 1,
        delimiterIndex != -1 ? delimiterIndex : node.path.length);

    // has colon or delimiter left? then split it into smaller node.
    if (node.path.lastIndexOf(':') != colonIndex || node.path.lastIndexOf('/') > colonIndex) {
        leafChild = splitParamNode(node);
    }

    // rest path
    node.setPath(node.path.slice(0, colonIndex));
    return leafChild;
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
            //if (node.handlers) {
            //    splitNode.handlers = node.handlers;
            //    node.handlers = {};
            //}
            node.setPath(node.path.slice(0, i));
            return node.addChild(splitNode);
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
 * @param {number} basePoint - new path's basePoint
 * @param {number} branchPointInPath - branch point(index) based on new path
 * @param {number} branchPointInNode - branch point(index) based on this node
 * @param {Node} parent
 * @param {string} newPath new path
 * @returns {Node} created node
 */
Node.prototype.branch = function(basePoint, branchPointInPath, branchPointInNode, parent, newPath) {
    let newNode = new Node(newPath.substring(branchPointInPath));
    let middleNode = new Node(this.path.slice(0, branchPointInNode));
    parent.replaceChild(this, middleNode);

    this.setPath(this.path.substring(branchPointInNode));
    middleNode.addChild(this);
    return middleNode.addChild(newNode);
};

/**
 * Branch new node and attach this node to it.
 *
 * The newer path is overlapping with this node - but it's shorter.
 * so cut this path and attach it to the new path node.
 *
 * @param {number} basePoint - new path's basePoint
 * @param {number} branchPoint - branch point(index) based on this node
 * @param {Node} parent
 * @param {string} newPath new path
 * @returns {Node} created node
 */
Node.prototype.branchUpper = function(basePoint, branchPoint, parent, newPath) {
    let newNode = new Node(newPath.substring(basePoint));
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
    for (let key in node) {
        if (node.hasOwnProperty(key) && key !== 'path' && key !== 'pathLength') {
            this[key] = node[key];
        }
    }
};

module.exports = Node;