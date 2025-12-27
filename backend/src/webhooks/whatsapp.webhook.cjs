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