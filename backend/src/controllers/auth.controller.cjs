const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db.cjs');

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
        { 
            sub: user.id 
        },
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

        const existing = await db.user.findUnique({ where: { email } });

        if (existing) {
            return res.status(409).json({ error: 'Email is already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                roleSlug: 'global:member'
            }
        });

        const tokens = generateTokens(newUser);

        return res.status(201).json({
            message: 'User registered successfully',
            ...tokens,
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.roleSlug
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

        const user = await db.user.findUnique({ 
            where: { email } 
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

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