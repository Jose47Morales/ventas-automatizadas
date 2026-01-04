module.exports = function rawBodyMiddleware(req, res, next) {
    if (req.headers['content-type'] === 'application/json') {
        let data = '';

        req.on('data', chunk => {
            data += chunk;
        });

        req.on('end', () => {
            req.rawBody = data;
            next();
        });
    } else {
        next();
    }
};