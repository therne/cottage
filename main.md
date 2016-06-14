# Installation
You need Node.js 0.12 or higher.

```
$ npm install --save cottage
```

# Features
- **Fastest Framework on Node** - See [performance](#performance)  
- **100% Koa.js compatible** - You can use all plugins and modules of koa.
- Simple code - Aren't you tired using `res.send` or `this.body`? Why can't we just `return` the response?
- [Additional Sugar Features](#status)


### Example
```js
const cottage = require('cottage');
const app = cottage();

app.get('/hello', function*(req, res) {
    let hello = yield asyncHello();
    return hello; // just return data
});

// 100% fully compatible with koa
app.use(koaMiddleware());

// because cottage is built on the top of Koa.
koa().use(app.callback()).listen(8080);

// simple shorthand without importing koa.
app.listen(8080);
```

### Performance
*Benchmark have been ran on Intel Xeon E3-1250v3 @ 3.50ghz with Node.js 6.1.0 single instance.*
*Tested from Github API sample using [wrk][wrk-repo]*

Framework       | Mean Throughput (req/sec) | Stddev |
----------------|---------------|-----------|
cottage@2.1.0   | 15130.12      | 142.45    |
express@4.13.4  | 11455.67      | 201.95    |
koa-router@5.4.0| 12279.01      | 157.33    |
hapi@13.4.1     | 2402.31       | 53.14     |

As the benchmark result shows, cottage is the fastest framework in Node.js.

#### Why?
Cottage uses [Radix Tree][radix-tree-wiki] for URL routing, which is faster than any other data structures.
Also, cottage uses technique called "middleware precomposition", which precomposes middleware only at first time, not the every runtime.

### Express style, but Koa
You can write down a code just as you've done on the [Express][express-repo],
but using [generator-based flow control][gen-flow] instead of [dirty callback hell]().

**NOTE THAT** It may look exactly like Express handler, but it's very different:
```js
function* (req, res, next) { }
```
- `req` is [koa.Request](http://koajs.com/#request)
- `res` is [koa.Response](http://koajs.com/#response)
- `next` is a `Generator` that points next middlewares
- `this` is [koa.Context](http://koajs.com/#context)

[gen-flow]: http://pag.forbeslindesay.co.uk
[wrk-repo]: https://github.com/wg/wrk
[express-repo]: https://github.com/expressjs/express
[radix-tree-wiki]: https://en.wikipedia.org/wiki/Radix_tree
