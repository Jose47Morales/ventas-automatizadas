// backend/server.cjs

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Pool } = require('pg');

const app = express();

// Configuración de CORS
const allowedOrigins = [
    'http://localhost:5173',           
    'http://localhost:3000',           
    'https://ventas-automatizadas.fly.dev',  
    process.env.FRONTEND_URL,          
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`CORS: Origin ${origin} no permitido`);
            callback(null, true);
        }
    },
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600, 
};

app.use(cors(corsOptions));
app.use('/webhooks/wompi', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;

// Configurar la conexión a PostgreSQL usando variables de entorno
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
    keepAlive: true,
});

pool.on('error', (err) => {
    console.error('Unexpected PG pool error:', err);
});

// Endpoint de salud
app.get('/health', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT 1 AS ok');
        res.json({ status: 'ok', db: rows[0].ok });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'db failed' });
    }
});

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

// Documentación Swagger
const { swaggerUi, swaggerDocument } = require('./src/swagger/swagger.cjs');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Endpoints para products
const productsRouter = require('./src/routes/products.routes.cjs');
app.use('/api/products', productsRouter);

// Endpoints para orders
const ordersRouter = require('./src/routes/orders.routes.cjs');
app.use('/api/orders', ordersRouter);

// Endpoints para payments
const paymentsRouter = require('./src/routes/payments.routes.cjs');
app.use('/api/payments', paymentsRouter);

// Endpoints para chat sessions
const chatSessionsRouter = require('./src/routes/chatSessions.routes.cjs');
app.use('/api/chat-sessions', chatSessionsRouter);

// Endpoints para analytics
const analyticsRouter = require('./src/routes/analytics.routes.cjs');
app.use('/api/analytics', analyticsRouter);

// Endpoints para sessions
const sessionRouter = require('./src/routes/sessions.routes.cjs');
app.use('/sessions', sessionRouter);

// Enpoints para auth
const authRouter = require('./src/routes/auth.routes.cjs');
app.use('/auth', authRouter);

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

// Endpoint de webhooks
const webhookRouter = require('./src/routes/webhooks.routes.cjs');
app.use('/webhooks', webhookRouter);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Exportar app
module.exports = app;