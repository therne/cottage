# Cottage
Cottage is the [Express](http://expressjs.com) style routing framework on [koa.js](https://github.com/koajs/koa).<br>
- No callback hells
- Even no <code>res.send</code>, <code>this.body</code>
  - Just return the result.

```js
var cottage = require('cottage');
var app = cottage();

app.get('/hello', function*(req) {
  return 'Hello world!';
});

app.get('/user/:id', function*(req) {
  var user = yield User.get(req.params.id);
  return user;
});

app.all(function*(req) {
  return 404;
})

// start server
var koa = require('koa');
koa().use(app).listen(8080);
```
