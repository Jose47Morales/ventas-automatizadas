const crypto = require("crypto");
const axios = require("axios");
const { pool } = require("../database/db.cjs");

exports.wompiWebhook = async (req, res) => {
    try {
        console.log("Webhook Wompi recibido");
        console.log("Headers:", req.headers);
        
        // Obtiene la firma del header
        const signature = req.headers["x-event-checksum"];
        
        if (!signature) {
            console.error("No se encontró el header x-event-checksum");
            return res.status(400).send("Missing signature");
        }

        const rawBody = req.body.toString("utf8");
        
        console.log("Raw body length:", rawBody.length);

        // Verifica que el secret existe
        if (!process.env.WOMPI_EVENTS_SECRET) {
            console.error("WOMPI_EVENTS_SECRET no configurado");
            return res.status(500).send("Server configuration error");
        }

        // Parsea el evento primero
        const event = JSON.parse(rawBody);
        console.log("Tipo de evento:", event.event);

        // Verifica que existen las propiedades necesarias
        if (!event.timestamp || !event.signature || !event.signature.properties) {
            console.error("Estructura de evento inválida");
            return res.status(400).send("Invalid event structure");
        }

        if (!event.data || !event.data.transaction) {
            console.error("No se encontró data.transaction en el evento");
            return res.status(400).send("Invalid event data");
        }

        const timestamp = event.timestamp;
        const signatureData = event.signature;
        const properties = signatureData.properties;
        const transaction = event.data.transaction;

        console.log("Properties a validar:", properties);

        // Construye el string para la firma según las propiedades indicadas
        let concatenatedValues = `${timestamp}`;
        
        for (const prop of properties) {
            
            console.log(`Buscando propiedad: ${prop}`);
            
            const actualProperty = prop.replace('transaction.', '');
            
            const value = transaction[actualProperty];
            
            if (value === undefined || value === null) {
                console.error(`No se encontró la propiedad: ${actualProperty} en transaction`);
                console.error(`Propiedades disponibles en transaction:`, Object.keys(transaction));
                return res.status(400).send(`Missing property: ${prop}`);
            }
            
            console.log(`Valor encontrado para ${prop}: ${value}`);
            concatenatedValues += `.${value}`;
        }
        
        concatenatedValues += `.${process.env.WOMPI_EVENTS_SECRET}`;

        console.log("String para firma:", concatenatedValues);

        // Calcula la firma esperada
        const expectedSignature = crypto
            .createHash("sha256")
            .update(concatenatedValues)
            .digest("hex");

        console.log("Firma recibida:", signature);
        console.log("Firma esperada:", expectedSignature);
        console.log("¿Coinciden?:", signature === expectedSignature);

        // Valida firma
        if (signature !== expectedSignature) {
            console.error("Firma inválida Wompi");
            console.error("String concatenado:", concatenatedValues);
            return res.status(401).send("Invalid signature");
        }

        console.log("Firma válida - procesando evento");

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
            amount: amount_in_cents / 100,
            method: payment_method_type
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
            console.warn("No se encontró el pago con referencia:", reference);
        } else {
            console.log("Pago actualizado en BD, ID:", updateResult.rows[0].id);
        }

        // Obtiene información del pedido y cliente
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
            console.log("Order ID:", order_id);
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

            console.log("Enviando a n8n:", n8nPayload);

            await axios.post(process.env.N8N_WEBHOOK_PAYMENTS, n8nPayload);
            console.log("Notificación enviada a n8n");
        } else {
            console.warn("N8N_WEBHOOK_PAYMENTS no configurado");
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error("Error webhook Wompi:", error.message);
        console.error("Stack:", error.stack);
        
        if (error instanceof SyntaxError) {
            return res.status(400).send("Invalid JSON");
        }
        
        return res.status(500).send("Webhook error");
    }
};