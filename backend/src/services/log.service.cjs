const db = require('../database/db.cjs');

async function saveLog({ type, phone, messageId, data }) {
    await db.logs.insert({
        type,
        phone,
        messageId,
        data,
        createdAt: new Date(),
    });
}

module.exports = { saveLog };