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

// Endpoints para orders
const ordersRouter = require('./src/routes/orders.routes.cjs');
app.use('/api/orders', ordersRouter);

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

// CRUD endpoints para productos

// Obtener todos los productos
app.get('/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id_producto DESC');
        res.json({ success: true, products: result.rows });
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Agregar un nuevo producto
app.post('/products', async (req, res) => {
    try {
        const data = req.body;

        const result = await pool.query(
            `INSERT INTO products 
            (nombre, referencia, codgigo_barras, invima, cum, codigo_producto_dian,
            existencias, impuesto, precioventa_con_impuesto, precio_venta_base,
            precio_venta_minimo, descuento_maximo_ps, precio_compra, precio_compraipm,
            total_impoconsumo, total_estampilla, icui, ibua, costo, stock_minimo,
            es_ingrediente, manejo_bascula, utilidad, mostrar_tienda, categoria,
            marca, codigo_cuenta, precio1, precio2, precio3, precio4, ubicacion, proveedor,
            nit_proveedor, url_imagen, nota, tipo_producto, imagenes, videos, realizar_pedido_solo_existencia,
            vender_solo_existencia) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $29,
            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41
            ) RETURNING *`,
            [
                data.nombre, data.referencia, data.codgigo_barras, data.invima, data.cum, data.codigo_producto_dian,
                data.existencias, data.impuesto, data.precioventa_con_impuesto, data.precio_venta_base,
                data.precio_venta_minimo, data.descuento_maximo_ps, data.precio_compra, data.precio_compraipm,
                data.total_impoconsumo, data.total_estampilla, data.icui, data.ibua, data.costo, data.stock_minimo,
                data.es_ingrediente, data.manejo_bascula, data.utilidad, data.mostrar_tienda, data.categoria,
                data.marca, data.codigo_cuenta, data.precio1, data.precio2, data.precio3, data.precio4, data.ubicacion, data.proveedor,
                data.nit_proveedor, data.url_imagen, data.nota, data.tipo_producto, data.imagenes, data.videos, data.realizar_pedido_solo_existencia,
                data.vender_solo_existencia
            ]
        );

        res.status(201).json({ success: true, product: result.rows[0] });
    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Obtener un producto por ID
app.get('/products/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products WHERE id_producto = $1', [req.params.id]);

        if (result.rowCount === 0)
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });

        res.json({ success: true, product: result.rows[0] });
    } catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Actualizar un producto por ID
app.put('/products/:id', async (req, res) => {
    try {
        const updates = [];
        const values = [];

        let index = 1;
        for (let key in req.body) {
            updates.push(`${key} = $${index}`);
            values.push(req.body[key]);
            index++;
        }

        values.push(req.params.id);
        const query = `UPDATE products SET ${updates.join(', ')} WHERE id_producto = $${index} RETURNING *`;
        const result = await pool.query(query, values);

        if (result.rowCount === 0)
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });

        res.json({ success: true, product: result.rows[0] });
    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Eliminar un producto por ID
app.delete('/products/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM products WHERE id_producto = $1 RETURNING *', [req.params.id]);

        if (result.rowCount === 0)
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });

        res.json({ success: true, product: result.rows[0] });
    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});