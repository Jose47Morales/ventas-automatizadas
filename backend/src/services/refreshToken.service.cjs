const { pool } = require('../database/db.cjs');

exports.saveRefreshToken = async (userId, token) => {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
        `
        INSERT INTO auth_refresh_tokens (userId, token, expires_at)
        VALUES ($1, $2, $3)
        `,
        [userId, token, expiresAt]
    );
};

exports.findValidRefreshToken = async (token) => {
    const { rows } = await pool.query(
        `
        SELECT * FROM auth_refresh_tokens
        WHERE token = $1 
            AND revoked = false
            AND expires_at > NOW()
        `,
        [token]
    );

    return rows[0];
};

exports.revokeRefreshToken = async (token) => {
    await pool.query(
        `
        UPDATE auth_refresh_tokens
        SET revoked = true
        WHERE token = $1
        `,
        [token]
    );
};

exports.touchRefreshToken = async (token) => {
    await pool.query(
        `
        UPDATE auth_refresh_tokens
        SET last_used_at = NOW()
        WHERE token = $1
        `,
        [token]
    );
};