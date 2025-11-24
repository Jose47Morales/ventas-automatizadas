// backend/server.cjs
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 4000;

// Configurar la conexión a PostgreSQL usando variables de entorno
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: { rejectUnauthorized: false }, // Para servicios gestionados
});

pool.connect()
    .then(() => console.log('Conectado a la base de datos correctamente'))
    .catch(err => console.error('Error conectando a la base de datos:', err));

app.use(bodyParser.json());

// Endpoint de verificación de WhatsApp
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

// Endpoint para recibir mensajes de WhatsApp y reenviarlos a n8n
app.post('/webhook/whatsapp-webhook', async (req, res) => {
    try {
        const body = req.body;
        res.sendStatus(200); // Confirmamos recepción

        const entry = body.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;
        const messages = value?.messages?.[0];

        if (!messages) return;

        const from = messages.from;
        const type = messages.type;
        let textBody = null;

        if (type === 'text') textBody = messages.text.body;
        else if (type === 'button') textBody = messages.button.text || messages.button.payload;

        const payload = { from, text: textBody, type, raw: body };

        await axios.post(process.env.WEBHOOK_URL, payload);
        console.log('Mensaje enviado a n8n:', payload);

    } catch (error) {
        console.error('Error procesando el mensaje:', error);
    }
});

// Endpoints para products
const productsRouter = require('./src/routes/products.routes.cjs');
app.use('/api/products', productsRouter);

// Endpoints para orders
const ordersRouter = require('./src/routes/orders.routes.cjs');
app.use('/api/orders', ordersRouter);

// Endpoints para payments
const paymentsRouter = require('./src/routes/payments.routes.cjs');
app.use('/api/payments', paymentsRouter);

// Endpoint para registrar logs
app.post('/logs', async (req, res) => {
    try {
        const { log_type, from_number, to_number, user_message, ai_response, intent, message_id, status, raw_data } = req.body;

        // Validar campos obligatorios
        if (!log_type) {
            return res.status(400).json({ success: false, message: 'Faltan campos obligatorios en el log' });
        }

        const query = `
            INSERT INTO whatsapp_logs
            (log_type, from_number, to_number, user_message, ai_response, intent, message_id, status, raw_data)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
        `;

        const values = [
            log_type,
            from_number || null,
            to_number || null,
            user_message || null,
            ai_response || null,
            intent || null,
            message_id || null,
            status || null,
            raw_data || null
        ];

        const result = await pool.query(query, values);

        res.status(201).json({ success: true, logId: result.rows[0].id });
    } catch (error) {
        console.error('Error creando log:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});