const crypto = require('crypto');

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
        const entry = req.body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        const message = value?.messages?.[0];

        if (!message) {
            return res.sendStatus(200);
        }

        const from = message.from;
        const type = message.type;

        let text = null;

        if (type === 'text') {
            text = message.text.body;
        }

        console.log('Mensaje recibido de WhatsApp');
        console.log({
            from,
            type,
            text,
            raw: message
        });

        return res.sendStatus(200);
    } catch (error) {
        console.error('Error procesando webhook WhatsApp: ', error);
        return res.sendStatus(200);
    }
};