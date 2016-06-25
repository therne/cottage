# cottage-example-slack-logger

Slack Logger by outgoing webhook with [Cottage](http://github.com/therne/cottage). Tested on Node.js v6.2.0.

It needs authorization token of your Slack. It's for find user's name when logging mentions.

## How to Run?

 - Install dependency modules with `npm install`.
 - Register Slack Outgoing Webhook with `http://yourdomain:4000/logger`.
 - Get your Slack Token and put it to `setting.json`.
 - Run it with `node index.js`!