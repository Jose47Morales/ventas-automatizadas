const crypto = require("crypto");
const axios = require("axios");
const { pool } = require("../database/db.cjs");

exports.wompiWebhook = async (req, res) => {
    try {
        console.log("Webhook Wompi recibido");
        
        // Obtiene la firma del header
        const signature = req.headers["x-event-checksum"];
        
        if (!signature) {
            console.error("No se encontró el header x-event-checksum");
            return res.status(400).send("Missing signature");
        }

        const rawBody = req.body.toString("utf8");

        // Verifica que el secret existe
        if (!process.env.WOMPI_EVENTS_SECRET) {
            console.error("WOMPI_EVENTS_SECRET no configurado");
            return res.status(500).send("Server configuration error");
        }

        // Parsea el evento primero
        const event = JSON.parse(rawBody);
        console.log("Tipo de evento:", event.event);

        // Verifica estructura
        if (!event.timestamp || !event.signature || !event.signature.properties) {
            console.error("Estructura de evento inválida");
            return res.status(400).send("Invalid event structure");
        }

        if (!event.data || !event.data.transaction) {
            console.error("No se encontró data.transaction");
            return res.status(400).send("Invalid event data");
        }

        // CONSTRUYE STRING PARA FIRMA
        const timestamp = event.timestamp;
        const signatureData = event.signature;
        const properties = signatureData.properties;
        const transaction = event.data.transaction;

        console.log("Properties a validar:", properties);
        console.log("Timestamp:", timestamp);

        // Concatena: timestamp + valores + secret
        let concatenatedValues = `${timestamp}`;
        
        for (const prop of properties) {
            const actualProperty = prop.replace('transaction.', '');
            const value = transaction[actualProperty];
            
            if (value === undefined || value === null) {
                console.error(`Propiedad no encontrada: ${actualProperty}`);
                return res.status(400).send(`Missing property: ${prop}`);
            }
            
            console.log(`${prop}: ${value}`);
            concatenatedValues += `${value}`;
        }
        
        concatenatedValues += `${process.env.WOMPI_EVENTS_SECRET}`;

        console.log("String para firma (sin puntos):", concatenatedValues);

        // Calcula SHA256
        const expectedSignature = crypto
            .createHash("sha256")
            .update(concatenatedValues)
            .digest("hex");

        console.log("Firma recibida:", signature);
        console.log("Firma esperada:", expectedSignature);

        // Valida firma
        if (signature !== expectedSignature) {
            console.error("Firma inválida");
            
            // Intenta con SHA256 del checksum que Wompi envía
            const checksumProvided = signatureData.checksum;
            console.log("Checksum de Wompi:", checksumProvided);
            
            if (checksumProvided === expectedSignature) {
                console.log("Firma válida usando checksum de Wompi");
            } else {
                console.error("String usado:", concatenatedValues);
                return res.status(401).send("Invalid signature");
            }
        } else {
            console.log("Firma válida");
        }

        const {
            id: wompi_transaction_id,
            status,
            reference,
            amount_in_cents,
            payment_method_type
        } = transaction;

        console.log("Transacción:", {
            id: wompi_transaction_id,
            status,
            reference,
            amount: amount_in_cents / 100
        });

        // Actualiza base de datos
        const updateResult = await pool.query(
            `
            UPDATE payments
            SET
                status = $1,
                updated_at = now()
            WHERE reference = $2
            RETURNING id
            `,
            [status, reference]
        );

        if (updateResult.rowCount === 0) {
            console.warn("Pago no encontrado:", reference);
        } else {
            console.log("Pago actualizado, ID:", updateResult.rows[0].id);
        }

        // Obtiene info del cliente
        const orderResult = await pool.query(
            `
            SELECT o.client_phone, o.client_name, o.id as order_id
            FROM orders o
            INNER JOIN payments p ON p.order_id = o.id
            WHERE p.reference = $1
            `,
            [reference]
        );

        let customer_phone = null;
        let customer_name = null;
        let order_id = null;

        if (orderResult.rows.length > 0) {
            customer_phone = orderResult.rows[0].client_phone;
            customer_name = orderResult.rows[0].client_name;
            order_id = orderResult.rows[0].order_id;
            console.log("Cliente:", customer_name, customer_phone);
        }

        // Notifica a n8n
        if (process.env.N8N_WEBHOOK_PAYMENTS) {
            const n8nPayload = {
                provider: "wompi",
                transaction_id: wompi_transaction_id,
                reference,
                status,
                amount: amount_in_cents / 100,
                payment_method: payment_method_type,
                event_type: event.event,
                customer_phone,
                customer_name,
                order_id
            };

            console.log("Enviando a n8n");
            await axios.post(process.env.N8N_WEBHOOK_PAYMENTS, n8nPayload);
            console.log("Notificación enviada");
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error("Error:", error.message);
        console.error(error.stack);
        return res.status(500).send("Webhook error");
    }
};