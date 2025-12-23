const jwt = require('jsonwebtoken');

exports.generateAccessToken = (user) => {
    return jwt.sign(
        {
            sub: user.id,
            role: user.roleSlug
        },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
    );
};

exports.generateRefreshToken = (user) => {
    return jwt.sign(
        { sub: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
};

exports.verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};