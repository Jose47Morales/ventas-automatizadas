const crypto = require('crypto');

module.exports.buildFingerprint = ({
    user_agent,
    device_name,
    ip_address,
}) => {
    const raw = `${user_agent || ''}|${device_name || ''}|${ip_address || ''}`;

    return crypto
        .createHash('sha256')
        .update(raw)
        .digest('hex');
};