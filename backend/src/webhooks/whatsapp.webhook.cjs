const axios = require('axios');

exports.verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log("WhatsApp webhook verificado correctamente");
        return res.status(200).send(challenge);
    }

    console.error("Falló verificación de webhook WhatsApp", {
        mode,
        token,
    });
    return res.sendStatus(403);
};

exports.receiveMessage = async (req, res) => {
    try {
        res.sendStatus(200);

        const entry = req.body.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;

        if (!value?.messages?.length) return;

        const message = value.messages[0];
        const contact = value.contacts?.[0];

        const payload = {
            from: message.from,
            message_id: message.id,
            timestamp: message.timestamp,
            type: message.type,
            text: message.text?.body || null,
            contact: {
                name: contact?.profile?.name || null,
                wa_id: contact?.wa_id || null
            },
            raw: value
        };

        await axios.post(
            process.env.N8N_WHATSAPP_WEBHOOK_URL,
            payload,
            {
                timeout: 5000,
            }
        );

        console.log('Mensaje enviado a n8n correctamente');

    } catch (error) {
        console.error('Error enviando mensaje a n8n: ', error.message);
    }
};