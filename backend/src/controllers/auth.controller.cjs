const authService = require('../services/auth.service.cjs');

// ================
//     REGISTER
// ================

exports.register = async (req, res) => {
    try {
        const user = await authService.reg;

        const exists = await pool.query(
            'SELECT id FROM "user" WHERE email = $1',
            [email]
        );

        if (exists.rowCount > 0) {
            return res.status(409).json({ error: 'Email is already registered' });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const { rows } = await pool.query(
            `
            INSERT INTO "user" (email, password, firstName, lastName, roleSlug)
            VALUES ($1, $2, $3, $4, 'global:member')
            RETURNING id, email, firstName, lastName, roleSlug
            `,
            [email, hashPassword, firstName || null, lastName || null]
        );

        return res.status(201).json({
            message: "User registered successfully",
            user: rows[0]
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// =============
//     LOGIN
// =============

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { rows } = await pool.query( 
            `SELECT * FROM user WHERE email = $1`,
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
        
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await refreshService.saveRefreshToken({
            user_id: user.id,
            token: refreshToken,
            expiresAt,
            user_agent: req.headers['user-agent'],
            ip_address: req.ip,
            device_name: req.headers['sec-ch-ua'] || null
        });

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

// =====================
//     REFRESH TOKEN
// =====================

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

        const payload = jwtUtils.verifyRefreshToken(refreshToken);

        await refreshService.revokeRefreshToken(refreshToken);

        const { rows } = await pool.query(
            `SELECT * FROM "user" WHERE id = $1`,
            [payload.sub]
        );

        const user = rows[0];

        const newAccessToken = jwtUtils.generateAccessToken(user);
        const newRefreshToken = jwtUtils.generateRefreshToken(user);

        await refreshService.saveRefreshToken({
            user_id: user.id,
            token: newRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            user_agent: stored.user_agent,
            ip_address: stored.ip_address,
            device_name: stored.device_name
        });

        return res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ==============
//     LOGOUT
// ==============

module.exports.logout = async (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
        await refreshService.revokeRefreshToken(refreshToken);
    }

    res.json({ message: 'Logged out successfully' });
};