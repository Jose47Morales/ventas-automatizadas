require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

// Endpoint to receive WhatsApp messages
app.get('/webhook/whatsapp-webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === process.env.VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Endpoint to handle incoming messages
app.post('/webhook/whatsapp-webhook', async (req, res) => {
    try {
        const body = req.body;

        // Confirmation of the message structure
        res.sendStatus(200);

        const entry = body.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;
        const messages = value?.messages?.[0];

        if (!messages) return;

        const from = messages.from; // Phone number of the sender
        const type = messages.type;
        let textBody = null;

        if (type === 'text') {
            textBody = messages.text.body;
        } else if (type === 'button') {
            textBody = messages.button.text || messages.button.payload;
        }

        const payload = {
            from,
            text: textBody,
            type,
            raw: body
        };

        // Forward the message to n8n webhook
        await axios.post(`${process.env.WEBHOOK_URL}`, payload);

        console.log('Message forwarded to n8n:', payload);

    } catch (error) {
        console.error('Error processing the message:', error);
        res.sendStatus(500);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});