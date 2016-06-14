<img alt="Cottage" src="http://i.imgur.com/jxXVfA1.png" width="400" />

[![Join Gitter chat][gitter-image]][gitter-url]
[![Show build status][travis-image]][travis-url]
[![Coverage report][coveralls-image]][coveralls-url]
[![npm Version][npm-image]][npm-url]  

Cottage is the fastest, simple, and intuitive server framework built on [Koa.js](http://koajs.com).<br>

- **Fastest Framework on Node** - See [performance](#performance)
- **100% Koa.js compatible** - You can use all plugins and modules of koa.
- Simple code - Aren't you tired using `res.send` or `this.body`? Why can't we just `return` the response?
- [Additional Sugar Features](#status)

### Installation
```
$ npm install --save cottage
```

Cottage requires [iojs](https://iojs.org) or [Node](http://nodejs.org) v4.0.0 or higher.  
To use it with Node v0.12, you must run `node` with the `--harmony` flag.

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
- `req` is [`koa.Request`](http://koajs.com/#request)
- `res` is [`koa.Response`](http://koajs.com/#response)
- `next` is a `Generator` that points next middlewares
- `this` is [`koa.Context`](http://koajs.com/#context)

## Documentations
- API Documentation *(Currently Working)*
- Samples *(Currently Working)*

## License: MIT

[gen-flow]: http://pag.forbeslindesay.co.uk
[wrk-repo]: https://github.com/wg/wrk
[express-repo]: https://github.com/expressjs/express
[radix-tree-wiki]: https://en.wikipedia.org/wiki/Radix_tree
[gitter-image]: https://img.shields.io/gitter/room/cottage/cottage.svg?style=flat-square
[gitter-url]: https://gitter.im/therne/cottage?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[npm-url]: https://npmjs.org/package/cottage
[npm-image]: https://img.shields.io/npm/v/cottage.svg?style=flat-square
[npm-url]: https://npmjs.org/package/cottage
[travis-image]: https://img.shields.io/travis/therne/cottage/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/therne/cottage
[coveralls-image]: https://img.shields.io/coveralls/therne/cottage.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/therne/cottage?branch=master