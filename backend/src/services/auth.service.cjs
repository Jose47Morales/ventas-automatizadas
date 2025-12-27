const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../database/db.cjs');
const sessionService = require('./sessions.service.cjs')

const ACCESS_EXPIRE = '15m';
const REFRESH_EXPIRE_DAYS = 7;

const generateAccessToken = (user) =>
    jwt.sign( 
        { sub: user.id, role: user.roleSlug }, 
        process.env.JWT_SECRET, 
        { expiresIn: ACCESS_EXPIRE }
    );

const generateRefreshToken = (userId) =>
    jwt.sign(
        { sub: userId }, 
        process.env.REFRESH_TOKEN_SECRET, 
        { expiresIn: `${REFRESH_EXPIRE_DAYS}d` }
    );

exports.register = async ({ email, password, firstName, lastName }) => {
    const exists = await pool.query(
        'SELECT id FROM "user" WHERE email = $1',
        [email]
    );
    if (exists.rowCount > 0) throw new Error('Email already registered');

    const hashed = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
        `
        INSERT INTO "user"(email, password, firstName, lastName, roleSlug)
        VALUES ($1, $2, $3, $4, 'global:member')
        RETURNING id, email, firstName, lastName, roleSlug
        `,
        [email, hashed, firstName || null, lastName || null]
    );

    return rows[0];
};

exports.login = async (ctx) => {
    const { rows } = await pool.query(
        'SELECT * FROM "user" WHERE email = $1',
        [ctx.email]
    );

    const user = rows[0];
    if (!user || user.disabled || user.compromised) {
        throw new Error('Invalid credentials');
    }

    const valid = await bcrypt.compare(ctx.password, user.password);
    if (!valid) throw new Error('Invalid credentials');

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date(
        Date.now() + REFRESH_EXPIRE_DAYS * 24 * 60 * 60 * 1000
    );

    await sessionService.createSession({
        userId: user.id,
        refreshToken,
        expiresAt,
        user_agent: ctx.user_agent,
        ip_address: ctx.ip_address,
        device_name: ctx.device_name,
    });

    return { accessToken, refreshToken };
};

exports.refreshToken = async (ctx) => {
    const payload = jwt.verify(
        ctx.refreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const stored = await sessionService.getSessionByToken(ctx.refreshToken);
    if (!stored) throw new Error('Invalid refresh token');

    await sessionService.validateSessionContext(stored, ctx);

    const { rows } = await pool.query(
        'SELECT roleSlug FROM "user" WHERE id = $1',
        [payload.sub]
    );

    const accessToken = generateAccessToken({ 
        id: payload.sub, 
        roleSlug: rows[0].roleslug,
    });

    const newRefreshToken = generateRefreshToken(payload.sub);

    await sessionService.rotateSession({
        stored,
        newRefreshToken,
        expiresAt: new Date(
            Date.now() + REFRESH_EXPIRE_DAYS * 24 * 60 * 60 * 1000
        ),
    });

    return { accessToken, refreshToken: newRefreshToken };
};