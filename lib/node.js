
var util = require('util');

/**
 * Tree node.
 * @param path {String}
 * @param handler {Function}
 */
function Node(path, handler) {
    this.path = path;
    if (handler) this.handler = handler;
    this.letterTable = new Map();

    // For better performance
    Object.defineProperty(this, 'continuingParamChild', { value: undefined, writable: true });
    Object.defineProperty(this, 'pathLength', { value: path.length, writable: true });
    Object.defineProperty(this, 'childrenCount', { value: 0, writable: true });
}

/**
 * Add child node.
 * @param child {Node}
 */
Node.prototype.addChild = function(child) {
    this.childrenCount++;
    this.letterTable.set(child.path[0], child);

    parameterInsertionCheck(child, this);
}

Node.prototype.setPath = function(path) {
    this.path = path;
    this.pathLength = path.length;
}

/**
 * Replace oldNode to newNode.
 */
Node.prototype.replaceChild = function(oldNode, newNode) {
    this.letterTable.set(oldNode.path[0], newNode);

    if (this.continuingParamChild) {
        this.continuingParamChild = null;
        newNode.continuingParamChild = oldNode;
    }
    else parameterInsertionCheck(newNode, oldNode); // this case may be from branchUpper method
}

/**
 * Branch this node and creates new Node.
 *
 * @param basePoint {Number} New path's basePoint
 * @param branchPointInPath {Number} branch point(index) based on new path
 * @param branchPointInNode {Number} branch point(index) based on this node
 * @param parent {Node}
 * @param newPath {Number} new path
 * @param handler {Function} handler function of new path
 */
Node.prototype.branch = function(basePoint, branchPointInPath, branchPointInNode, parent, newPath, handler) {
    var dummyNode = new Node(this.path.substring(0, branchPointInNode));
    parent.replaceChild(this, dummyNode);

    this.setPath(this.path.substring(branchPointInNode));
    dummyNode.addChild(this);
    dummyNode.addChild(new Node(newPath.substring(branchPointInPath), handler));

    // also slice paramNames
    var paramCountAfterBranchPoint = countParameter(dummyNode.path);
    if (paramCountAfterBranchPoint != 0) {
        dummyNode.paramNames = this.paramNames.slice(0, paramCountAfterBranchPoint);
        this.paramNames = this.paramNames.slice(paramCountAfterBranchPoint);
    }
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
 * @param newPath {Number} new path
 * @param handler {Function} handler function of new path
 */
Node.prototype.branchUpper = function(basePoint, branchPoint, parent, newPath, handler) {
    var newNode = new Node(newPath.substring(basePoint), handler);
    parent.replaceChild(this, newNode);

    this.setPath(this.path.substring(branchPoint));
    newNode.addChild(this);

    // also slice paramNames
    var paramCountBeforeBranchPoint = countParameter(this.path, branchPoint);
    if (paramCountBeforeBranchPoint != 0) {
        this.paramNames = this.paramNames.slice(paramCountBeforeBranchPoint);

        // 평소엔 countinuingParamChild 상황시 아래 setPath에서 해결해주는데
        // 이곳은 그 혜택을 받지 못하므로....
        if (this.path[branchPoint] === ':') newNode.continuingParamChild = this;
    }
}

function countParameter(str, endPoint) {
    endPoint = endPoint || str.length;
    var count=0, i;
    for (i=0; i<endPoint; i++) {
        if (str[i] === ':') count++;
    }
    return count;
}

function parameterInsertionCheck(node, parent) {
    var alreadyFound = false, index;

    for (index=0; index<node.path.length; index++) {
        if (node.path[index] === ':' && node.path[index+1] != '/' && index != node.path.length-1) {

            if (!alreadyFound) {
                // initialize
                node.paramNames = [];
            }

            var i = index+1; // skip ':'
            var paramName = '';

            while (i != node.path.length && node.path[i] !== '/') paramName += node.path[i++];
            node.setPath(node.path.substring(0, index+1) + node.path.substring(i)); // skip the paramName
            node.paramNames.push(paramName);

            if (index == 0) {
                // param child (: or *) is continuing after the parent node
                parent.continuingParamChild = node;
            }

            alreadyFound = true;
        }
    }
}


module.exports = Node;