const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../database/db.cjs');

const ACCESS_EXPIRE = '15m';
const REFRESH_EXPIRE = '7d';

const REFRESH_STORE = new Map();

function generateTokens(user) {
    const payload = { 
        id: user.id, 
        role: user.roleSlug,
    };

    const accessToken = jwt.sign(
        payload, 
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_EXPIRE }
    );

    const refreshToken = jwt.sign(
        payload, 
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_EXPIRE }
    );

    REFRESH_STORE.set(String(user.id), refreshToken);

    return { accessToken, refreshToken };
}

exports.register = async (body) => {
    const { email, password, firstName, lastName } = body;

    const exists = await pool.query(
        'SELECT id FROM users WHERE email = $1', 
        [email]
    );

    if (exists.rowCount > 0) {
        throw new Error('Email is already registered');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = await pool.query(
        `
        INSERT INTO user (email, password, firstName, lastName) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, name, email, firstName, lastName
        `,
        [email, hashedPassword, firstName || null, lastName || null]
    );

    const user = result.rows[0];

    return {
        message: 'User registered successfully',
        user,
    };
};

exports.login = async (body) => {
    const { email, password } = body;

    const result = await pool.query(
        `
        SELECT id, email, password, firstName, lastName, roleSlug, disabled 
        FROM user 
        WHERE email = $1
        `, 
        [email]
    );

    if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
    }

    const user = result.rows[0];

    if (user.disabled) {
        throw new Error('User account is disabled');
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
        throw new Error('Invalid email or password');
    }

    const tokens = generateTokens(user);

    return {
        message: 'Login successful',
        user: { 
            id: user.id, 
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.roleSlug,
        },
        ...tokens,
    };
};

exports.refreshToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error('No refresh token provided');
    }
    
    let payload;
    try {
        payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
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