module.exports = async function cottage404(context, next) {
    context.response.body = 'Not Found';
    context.response.status = 404;
    await next();
};
