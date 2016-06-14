
module.exports = function* cottage404(next) {
    this.response.res.body = '<h1>Not Found</h1><p>The URL you requested was not found.</p>';
    yield *next;
};
