<img alt="Cottage" src="http://i.imgur.com/jxXVfA1.png" width="400" />

[![Join Gitter chat][gitter-image]][gitter-url]
[![Show build status][travis-image]][travis-url]
[![Coverage report][coveralls-image]][coveralls-url]
[![npm Version][npm-image]][npm-url]  

Cottage is the fastest, simple, and intuitive HTTP router framework for [Koa.js](http://koajs.com).<br>

- **Fastest HTTP Router / Framework on Node** - See [performance](#performance)
- Simple code - Aren't you tired using `res.send` or `ctx.body`? Why can't we just `return` the response?
- [Additional Sugar Features](#status)

### Installation
Cottage requires [Node](http://nodejs.org) v8.0.0 or higher.
```
$ npm install cottage
```

### Example
```js
import { Cottage, Response } from 'cottage';
const app = new Cottage();

// just simple return would be enough
app.post('/', async ctx => 'Hello world!');

app.get('/auth', async ctx => {
    // needs fancy response code?
    return new Response(401, { error: 'unauthorized' });
});

// cottage is built on the top of Koa.
app.use(anyKoaMiddleware());
(new Koa).use(app.callback()).listen(...);

// or a simple shorthand without importing Koa.
app.listen(8080, () => console.log('Independent!'));
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

## Documentations
- [API Documentation](https://github.com/therne/cottage/blob/master/index.d.ts)
- [Samples](https://github.com/therne/cottage/tree/master/samples)

## License: MIT

[gen-flow]: http://pag.forbeslindesay.co.uk
[wrk-repo]: https://github.com/wg/wrk
[express-repo]: https://github.com/expressjs/express
[radix-tree-wiki]: https://en.wikipedia.org/wiki/Radix_tree
[gitter-image]: https://img.shields.io/gitter/room/cottage/cottage.svg?style=for-the-badge&logo=gitter
[gitter-url]: https://gitter.im/therne/cottage?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[npm-url]: https://npmjs.org/package/cottage
[npm-image]: https://img.shields.io/npm/v/cottage.svg?style=for-the-badge
[npm-url]: https://npmjs.org/package/cottage
[travis-image]: https://img.shields.io/travis/therne/cottage/master.svg?style=for-the-badge
[travis-url]: https://travis-ci.org/therne/cottage
[coveralls-image]: https://img.shields.io/coveralls/therne/cottage.svg?style=for-the-badge
[coveralls-url]: https://coveralls.io/github/therne/cottage?branch=master
