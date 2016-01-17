
exports.api = [
    // Activities
    ["GET", "/people/:userId/activities/:collection"],
    ["GET", "/activities/:activityId"],
    ["GET", "/activities"],

    // Comments
    ["GET", "/activities/:activityId/comments"],
    ["GET", "/comments/:commentId"],

    // Moments
    ["POST", "/people/:userId/moments/:collection"],
    ["GET", "/people/:userId/moments/:collection"],
    ["DELETE", "/moments/:id"],

    ["GET", "/people/:userId"],
    ["GET", "/people"],
    ["GET", "/activities/:activityId/people/:collection"],
    ["GET", "/people/:userId/people/:collection"],
    ["GET", "/people/:userId/openIdConnect"],
];

exports.data = [
    ["GET", "/people"],
    ["GET", "/people/118051310819094153327"],
    ["GET", "/people/118051310819094153327/activities/123456789"]
];
