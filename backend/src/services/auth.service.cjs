const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Users = require('../models/Users.cjs');
const REFRESH_STORE = new Map();

const ACCESS_EXPIRE = '15m';
const REFRESH_EXPIRE = '7d';

function generateTokens(user) {
    const payload = { id: user.id, role: user.role };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: ACCESS_EXPIRE,
    });

    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { 
        expiresIn: REFRESH_EXPIRE,
    });

    REFRESH_STORE.set(String(user.id), refreshToken);

    return { accessToken, refreshToken };
}

exports.register = async (body) => {
    const exists = await Users.findOne({ email: body.email });
    if (exists) throw new Error('Email is already registered');

    const hashed = bcrypt.hashSync(body.password, 10);

    const user = await Users.create({
        name: body.name,
        email: body.email,
        password: hashed,
    });

    return {
        message: 'User registered successfully',
        user: { id: user.id, name: user.name, email: user.email }
    };
};

exports.login = async (body) => {
    const user = await Users.findOne({ email: body.email });
    if (!user) throw new Error('Invalid email or password');

    const valid = bcrypt.compareSync(body.password, user.password);
    if (!valid) throw new Error('Invalid email or password');

    const tokens = generateTokens(user);

    return {
        message: 'Login successful',
        user: { id: user.id, name: user.name, email: user.email },
        ...tokens,
    };
};

exports.refreshToken = async (refreshToken) => {
    if (!refreshToken) throw new Error('No refresh token provided');

    let payload;
    try {
        payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        throw new Error('Invalid refresh token');
    }

    const saved = REFRESH_STORE.get(String(payload.id));
    if (!saved || saved !== refreshToken) {
        throw new Error('Refresh token does not match');
    }

    const tokens = generateTokens(payload);

    return {
        message: 'Token refreshed successfully',
        ...tokens,
    };
};