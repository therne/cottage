# Installation
You need Node.js 7.6.0 or higher.

```
$ npm install --save cottage
```

To use it with older versions, you must use Babel's [require hook](http://babeljs.io/docs/usage/babel-register/) to transpile code.

# Features
- Fastest Framework on Node - See [performance](#performance)
- **100% Koa.js compatible** - You can use all plugins and modules of Koa v2.
- Simple code - Aren't you tired using `res.send` or `ctx.body`? Why can't we just `return` the response?
- [Additional Sugar Features](#response)


# Example
```js
const Cottage = require('cottage');
const app = new Cottage();

app.post('/', async () => 'Hello world!');

app.get('/hello', async ctx => {
    const hello = await asyncHello();
    return hello; // just return data
});

// 100% fully compatible with koa
app.use(koaMiddleware());

// because cottage is built on the top of Koa.
(new Koa).use(app.callback()).listen(8080);

// simple shorthand without importing Koa.
app.listen(8080);
```

# Performance
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

# Sugar Features
### Handlers
You can use `return` keyword to set the body on Cottage.

```js
app.get('/', async () => {
    return 'Hello, world!';
});

// Extremely simplified
app.get('/', async () => 'Hello, world!');
```

### Response
Cottage provides `Response` class to easily deal with responses.

```js
const Response = Cottage.Response;

// Simple usage
app.get('/', async () => new Response(404, 'Not Found!'));

// With predefined responses
Response.define('notFound', 404, {
    customMsg: 'Not Found!'
});

app.get('/', async () => Response.from('notFound')); 
// this will produce HTTP 404 {"customMsg": "Not Found!"}
``` 


[gen-flow]: http://pag.forbeslindesay.co.uk
[wrk-repo]: https://github.com/wg/wrk
[express-repo]: https://github.com/expressjs/express
[radix-tree-wiki]: https://en.wikipedia.org/wiki/Radix_tree


## Documentations
- API Documentation *(Currently Working)*
- Samples *(Currently Working)*
