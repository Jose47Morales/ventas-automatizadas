const bcrypt = require('bcryptjs');
const { pool } = require('../database/db.cjs');
const jwtUtils = require('../utils/jwt.cjs');
const refreshService = require('../services/refreshToken.service.cjs');

// ===========================
//     REGISTER CONTROLLER
// ===========================

module.exports.register = async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        const exists = await pool.query(
            'SELECT id FROM user WHERE email = $1', 
            [email]
        );

        if (exists.rowCount > 0) {
            return res.status(409).json({ error: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `
            INSERT INTO user (email, password, firstName, lastName, roleSlug)
            VALUES ($1, $2, $3, $4, 'global:member')
            RETURNING id, email, firstName, lastName, roleSlug
            `,
            [email, hashedPassword, firstName || null, lastName || null]
        );

        const user = result.rows[0];
        const tokens = generateTokens(user);

        return res.status(201).json({
            message: 'User registered successfully',
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.roleSlug
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ===========================
//      LOGIN CONTROLLER
// ===========================

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { rows } = await pool.query( 
            `SELECT * FROM user 
            WHERE email = $1
            `,
            [email]
        );

        const user = rows[0];

        if (!user || user.disabled) {
            return res.status(403).json({ error: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const accessToken = jwtUtils.generateAccessToken(user);
        const refreshToken = jwtUtils.generateRefreshToken(user);

        await refreshService.saveRefreshToken(user.id, refreshToken);

        return res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.roleSlug
            },
        });

    } catch (error) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        const stored = await refreshService.findValidRefreshToken(refreshToken);
        if (!stored) {
            return res.status(401).json({ error: 'Invalid or expired refresh token' });
        }

        const payload = jwtUtils.verifyAccessToken(refreshToken);

        await refreshService.verifyRefreshToken(refreshToken);

        const { rows } = await pool.query(
            `SELECT * FROM user WHERE id = $1`,
            [payload.sub]
        );

        const user = rows[0];

        const newAccessToken = jwtUtils.generateAccessToken(user);
        const newRefreshToken = jwtUtils.generateRefreshToken(user);

        await refreshService.saveRefreshToken(user.id, newRefreshToken);

        return res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports.logout = async (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
        await refreshService.revokeRefreshToken(refreshToken);
    }

    return res.json({ message: 'Logged out successfully' });
};