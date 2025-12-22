const jwt = require('jsonwebtoken');

const ACCESS_EXPIRE = '2h';
const REFRESH_EXPIRE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

exports.generateAccessToken = (user) => {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.roleSlug
        },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_EXPIRE }
    );
};

exports.generateRefreshToken = (user) => {
    return jwt.sign(
        { sub: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_EXPIRE_SECONDS }
    );
};

exports.verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};