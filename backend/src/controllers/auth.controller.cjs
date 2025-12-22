const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../database/db.cjs');

// ==============================================
//     GENERADOR DE TOKENS (ACCESO Y REFRESH)
// ==============================================

function generateTokens(user) {
    const accessToken = jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.roleSlug
        },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
    );

    const refreshToken = jwt.sign(
        { sub: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
}

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

        const result = await pool.query( 
            `SELECT id, email, firstName, lastName, roleSlug, password, disabled 
            FROM user 
            WHERE email = $1
            `,
            [email]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        if (user.disabled) {
            return res.status(403).json({ error: 'User account is disabled' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const tokens = generateTokens(user);

        return res.status(200).json({
            message: 'Login successful',
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
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};