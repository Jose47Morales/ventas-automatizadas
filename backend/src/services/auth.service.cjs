const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../database/db.cjs');
const sessionService = require('./sessions.service.cjs')

const ACCESS_EXPIRE = '15m';
const REFRESH_EXPIRE_DAYS = 7;

const accessToken = (user) =>
    jwt.sign({ sub: user.id, role: user.roleSlug }, process.env.JWT_SECRET, {
        expiresIn: ACCESS_EXPIRE,
    });

const refreshToken = (user) =>
    jwt.sign({ sub: user.id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: `${REFRESH_EXPIRE_DAYS}d`,
    });

exports.login = async (ctx) => {
    const { email, password } = ctx;

    const { rows } = await pool.query(
        'SELECT * FROM "user" WHERE email = $1',
        [email]
    );

    const user = rows[0];
    if (!user || user.disabled || user.compromised) {
        throw new Error('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid credentials');

    const at = accessToken(user);
    const rt = refreshToken(user);

    const expiresAt = new Date(
        Date.now() + REFRESH_EXPIRE_DAYS * 24 * 60 * 60 * 1000
    );

    await sessionService.createSession({
        userId: user.id,
        refreshToken: rt,
        expiresAt,
        ...ctx,
    });

    return { accessToken: at, refreshToken: rt };
};

exports.refreshToken = async (ctx) => {
    const payload = jwt.verify(
        ctx.refreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const stored = await sessionService.getSessionByToken(ctx.refreshToken);
    if (!stored) throw new Error('Invalid refresh token');

    await sessionService.validateSessionContext(stored, ctx);

    const at = accessToken({ id: payload.sub, roleSlug: stored.role });
    const rt = refreshToken({ id: payload.sub });

    await sessionService.rotateSession({
        stored,
        newRefreshToken: rt,
        expiresAt: new Date(
            Date.now() + REFRESH_EXPIRE_DAYS * 24 * 60 * 60 * 1000
        ),
    });

    return { accessToken: at, refreshToken: rt };
};