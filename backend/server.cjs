require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const { pool, testConnection } = require('./src/database/db.cjs');

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

app.post('/orders', async (req, res) => {
  try {
    const { client_name, client_phone, product_id, quantity, total, payment_status } = req.body;
    console.log('Incoming order:', { client_name, client_phone, product_id, quantity, total, payment_status });

    const result = await pool.query(
      'INSERT INTO orders (client_name, client_phone, product_id, quantity, total, payment_status, date) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id',
      [client_name, client_phone, product_id, quantity, total, payment_status]
    );

    console.log('Order inserted with ID:', result.rows[0].id);

    res.status(201).json({ success: true, orderId: result.rows[0].id });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});