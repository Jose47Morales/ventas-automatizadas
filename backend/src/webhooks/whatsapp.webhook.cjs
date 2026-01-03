const axios = require('axios');
const crypto = require('crypto');
const { default: e } = require('express');

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(phoneNumber) {
    const now = Date.now();
    const userKey = `rate_${phoneNumber}`;

    if (!rateLimitMap.has(userKey)) {
        rateLimitMap.set(userKey, {
            count: 1,
            windowStart: now
        });
        return true;
    }

    if (now - phoneRateLimit.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(phoneNumber, {
            requests: 1,
            windowStart: now
        });
        return true;
    }

    const userData = rateLimitMap.get(userKey);

    if (now - userData.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(userKey, {
            count: 1,
            windowStart: now
        });
        return true;
    }

    userData.count++;

    if (userData.count > MAX_REQUESTS_PER_WINDOW) {
        console.warn(`Límite de tasa excedido para el número: ${phoneNumber}`);
        return false;
    }

    return true;
}

function validateMetaSignature(req) {
    const signature = req.headers['x-hub-signature-256'];
    
    if (!signature) {
        console.error("Falta la firma en los encabezados");
        return false;
    }

    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) {
        console.error("Falta el token de verificación de WhatsApp en las variables de entorno");
        return false;
    }

    const rawBody = JSON.stringify(req.body);
    const expectedSignature = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');

    try {
        const isValid = crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );

        if (!isValid) {
            console.error("La firma de la solicitud no es válida");
            console.error(`Firma recibida: ${signature.substring(0, 20)}...`);
            console.error(`Firma esperada: ${expectedSignature.substring(0, 20)}...`);
        }

        return isValid;
    } catch (error) {
        console.error("Error al validar la firma: ", error.message);
        return false;
    }
}

exports.verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log("Verificando webhook WhatsApp");

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log("WhatsApp webhook verificado correctamente");
        return res.status(200).send(challenge);
    }

    console.error("Falló verificación de webhook WhatsApp", {
        mode,
        tokenPresent: !!token,
    });
    return res.sendStatus(403);
};

exports.receiveMessage = async (req, res) => {
    try {
        if (!validateMetaSignature(req)) {
            console.error("Solicitud no válida: firma inválida");
            return res.sendStatus(403).json({ error: "Firma inválida" });
        }

        const entry = req.body.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;

        if (!value?.messages?.length) {
            console.log("No hay mensajes para procesar");
            return res.sendStatus(200);
        }

        const message = value.messages[0];
        const contact = value.contacts?.[0];
        const phoneNumber = message.from;

        if (!checkRateLimit(phoneNumber)) {
            console.warn(`Límite de tasa excedido para el número: ${phoneNumber}`);
            return res.status(429).json({ error: "Límite de tasa excedido" });
        }

        const payload = {
            from: phoneNumber,
            message_id: message.id,
            timestamp: message.timestamp,
            type: message.type,
            text: message.text?.body || null,
            contact: {
                name: contact?.profile?.name || null,
                wa_id: contact?.wa_id || null
            },
            raw: value,
            validated_by: 'backend',
            validated_at: new Date().toISOString()
        };

        const n8nUrl = process.env.N8N_WHATSAPP_WEBHOOK_URL;
        const n8nToken = process.env.N8N_WEBHOOK_AUTH_TOKEN;

        if (!n8nUrl || !n8nToken) {
            throw new Error("Falta la URL del webhook de n8n o el token de autenticación en las variables de entorno");
        }

        await axios.post(
            n8nUrl,
            payload,
            {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                    'X-N8N-Auth-Token': n8nToken
                }
            }
        );

        console.log('Mensaje enviado a n8n correctamente');

        return res.sendStatus(200);

    } catch (error) {
        console.error('Error enviando mensaje a n8n: ', error.message);

        if (error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED') {
            return res.status(503).json({ error: "Servicio n8n no disponible" });
        }

        return res.sendStatus(200);
    }
};