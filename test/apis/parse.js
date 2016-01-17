
exports.api = [
    // Objects
    ["POST", "/1/classes/:className"],
    ["GET", "/1/classes/:className/:objectId"],
    ["PUT", "/1/classes/:className/:objectId"],
    ["GET", "/1/classes/:className"],
    ["DELETE", "/1/classes/:className/:objectId"],

    // Users
    ["POST", "/1/users"],
    ["GET", "/1/login"],
    ["GET", "/1/users/:objectId"],
    ["PUT", "/1/users/:objectId"],
    ["GET", "/1/users"],
    ["DELETE", "/1/users/:objectId"],
    ["POST", "/1/requestPasswordReset"],

    // Roles
    ["POST", "/1/roles"],
    ["GET", "/1/roles/:objectId"],
    ["PUT", "/1/roles/:objectId"],
    ["GET", "/1/roles"],
    ["DELETE", "/1/roles/:objectId"],

    // Files
    ["POST", "/1/files/:fileName"],

    // Analytics
    ["POST", "/1/events/:eventName"],

    // Push Notifications
    ["POST", "/1/push"],

    // Installations
    ["POST", "/1/installations"],
    ["GET", "/1/installations/:objectId"],
    ["PUT", "/1/installations/:objectId"],
    ["GET", "/1/installations"],
    ["DELETE", "/1/installations/:objectId"],

    // Cloud Functions
    ["POST", "/1/functions"],
];

exports.data = [
    ["GET", "/1/functions"],
    ['GET', '/1/classes/go'],
    ['GET', '/1/classes/go/1234567890'],
    ['GET', '/1/installations/abcdasdf'],
];
