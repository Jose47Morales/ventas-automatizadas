const sessionService = require('../services/sessions.service.cjs');

exports.listSessions = async (req, res) => {
    const sessions = await sessionService.listSessions(req.user.sub);
    res.json({ sessions });
};

exports.revokeSession = async (req, res) => {
    const ok = await sessionService.revokeSession(
        req.user.sub,
        req.params.id
    );
    
    if (!ok) return res.status(404).json({ error: 'Session not found' });
    res.json({ message: 'Session revoked' });
};

exports.markAccountCompromised = async (req, res) => {
    await sessionService.markAccountCompromised(req.user.sub);
    res.json({  message: 'Account marked as compromised'});
};