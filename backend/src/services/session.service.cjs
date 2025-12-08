const db = require('../database/db.cjs');

async function getOrCreateSession(phone) {
    let session = await db.sessions.findOne({ phone });

    if (!session) {
        session = await db.sessions.insert({
            phone,
            jsonData: {},
            updateAt: new Date(),
        });
    }

    return session;
}

async function updateSession(phone, data) {
    const session = await getOrCreateSession(phone);

    const newJson = {
        ...session.jsonData,
        ...data,
    };

    await db.sessions.update(
        { phone },
        { $set: { jsonData: newJson, updateAt: new Date() } }
    );

    return newJson;
}

async function clearSession(phone) {
    await db.sessions.update(
        { phone },
        { $set: { jsonData: {}, updateAt: new Date() } }
    );
}

module.exports = {
    getOrCreateSession,
    updateSession,
    clearSession,
};