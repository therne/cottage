async function defaultHandler(ctx, next) {
    await next();
}

module.exports = defaultHandler;
