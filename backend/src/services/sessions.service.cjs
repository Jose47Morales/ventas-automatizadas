const { pool } = require('../database/db.cjs');
const { buildFingerprint } = require('../utils/fingerprint.cjs');

exports.createSession = async ({
    userId,
    refreshToken,
    expiresAt,
    user_agent,
    ip_address,
    device_name,
}) => {
    const fingerprint = buildFingerprint({ user_agent, ip_address, device_name });

    await pool.query(
        `
        INSERT INTO auth_refresh_tokens
        (user_id, token, expires_at, user_agent, ip_address, device_name, fingerprint_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
            userId,
            refreshToken,
            expiresAt,
            user_agent,
            ip_address,
            device_name,
            fingerprint,
        ]
    );
};

exports.getSessionByToken = async (token) => {
    const { rows } = await pool.query(
        `SELECT * FROM auth_refresh_tokens WHERE token = $1`,
        [token]
    );
    return rows[0];
};

exports.validateSessionContext = async (stored, ctx) => {
    const fingerprint = buildFingerprint({
        user_agent: ctx.user_agent,
        ip_address: ctx.ip_address,
        device_name: ctx.device_name,
    });

    if (
        stored.revoked ||
        stored.user_agent !== ctx.user_agent ||
        stored.ip_address !== ctx.ip_address ||
        stored.fingerprint_hash !== fingerprint
    ) {
        await exports.markAccountCompromised(stored.userId);
        throw new Error('Account compromised');
    }
};

exports.rotateSession = async ({ stored, newRefreshToken, expiresAt }) => {
    await pool.query(
        `
        UPDATE auth_refresh_tokens
        SET revoked = true, last_used_at = NOW()
        WHERE id = $1
        `,
        [stored.id]
    );

    await exports.createSession({
        userId: stored.user_id,
        refreshToken: newRefreshToken,
        expiresAt,
        user_agent: stored.user_agent,
        ip_address: stored.ip_address,
        device_name: stored.device_name,
    });
};

exports.listSessions = async (userId) => {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM auth_refresh_tokens
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
    );
    return rows;
};

exports.revokeSession = async (userId, sessionId) => {
    const res = await pool.query(
        `
        UPDATE auth_refresh_tokens
        SET revoked = true
        WHERE id = $1 AND user_id = $2
        `,
        [sessionId, userId]
    );
    return res.rowCount > 0;
};

exports.revokeAllSessions = async (userId) => {
    await pool.query(
        `UPDATE auth_refresh_tokens SET revoked = true WHERE user_id = $1`,
        [userId]
    );
};

exports.markAccountCompromised = async (userId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(
            `
            UPDATE "user"
            SET compromised = true,
                compromised_at = NOW()
            WHERE id = $1
            `,
            [userId]
        );

        await client.query(
            `
            UPDATE auth_refresh_tokens
            SET revoked = true
            WHERE user_id = $1
            `,
            [userId]
        );

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};