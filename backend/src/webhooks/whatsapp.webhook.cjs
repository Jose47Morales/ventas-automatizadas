exports.verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'suscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log("WhatsApp webhook verificado correctamente");
        return res.status(200).send(challenge);
    }

    console.error("Falló verifiación de webhook WhatsApp");
    return res.sendStatus(403);
};