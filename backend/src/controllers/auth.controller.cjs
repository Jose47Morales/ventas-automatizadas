const authService = require('../services/auth.service.cjs');

exports.register = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({ user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const tokens = await authService.login({
            email: req.body.email,
            password: req.body.password,
            user_agent: req.headers['user-agent'],
            ip_address: req.ip,
            device_name: req.headers['sec-ch-ua'] || null,
        });
        res.json(tokens);
    } catch (err) {
        return res.status(401).json({ error: err.message });
    }
};

module.exports.refreshToken = async (req, res) => {
    try {
        const tokens = await authService.refreshToken({
            refreshToken: req.body.refreshToken,
            user_agent: req.headers['user-agent'],
            ip_address: req.ip,
            device_name: req.headers['sec-ch-ua'] || null,
        });
        res.json(tokens);
    } catch (err) {
        return res.status(401).json({ error: err.message });
    }
};