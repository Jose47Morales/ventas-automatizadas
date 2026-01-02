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

        // Parsea el evento
        const event = JSON.parse(rawBody);
        console.log("📋 Tipo de evento:", event.event);

        // Verificar estructura
        if (!event.signature || !event.signature.checksum) {
            console.error("No se encontró signature.checksum en el evento");
            return res.status(400).send("Invalid event structure");
        }

        if (!event.data || !event.data.transaction) {
            console.error("No se encontró data.transaction");
            return res.status(400).send("Invalid event data");
        }

        const checksumFromBody = event.signature.checksum;
        const checksumFromHeader = signature;

        console.log("Checksum del body:", checksumFromBody);
        console.log("Checksum del header:", checksumFromHeader);
        console.log("¿Coinciden?:", checksumFromBody === checksumFromHeader);

        // Valida que coincidan
        if (checksumFromBody !== checksumFromHeader) {
            console.error("Los checksums no coinciden");
            console.error("Header:", checksumFromHeader);
            console.error("Body:", checksumFromBody);
            return res.status(401).send("Invalid signature");
        }

        console.log("Firma válida - procesando evento");

        const transaction = event.data.transaction;

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
            console.warn("Pago no encontrado con referencia:", reference);
        } else {
            console.log("Pago actualizado en BD, ID:", updateResult.rows[0].id);
        }

        // Obtener info del cliente
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
            console.log("Cliente encontrado:", customer_name, "-", customer_phone);
            console.log("Order ID:", order_id);
        } else {
            console.warn("No se encontró el cliente para la referencia:", reference);
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

            console.log("Enviando notificación a n8n:", JSON.stringify(n8nPayload, null, 2));
            
            try {
                const response = await axios.post(
                    process.env.N8N_WEBHOOK_PAYMENTS, 
                    n8nPayload,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        timeout: 10000
                    }
                );
                console.log("Notificación enviada exitosamente a n8n");
                console.log("Respuesta de n8n:", response.status, response.data);
            } catch (axiosError) {
                console.error("Error al enviar a n8n:", axiosError.message);
                if (axiosError.response) {
                    console.error("Respuesta de error:", axiosError.response.status, axiosError.response.data);
                }
            }
        } else {
            console.warn("N8N_WEBHOOK_PAYMENTS no está configurado");
        }

        return res.status(200).json({ 
            received: true,
            transaction_id: wompi_transaction_id,
            status: status
        });

    } catch (error) {
        console.error("Error procesando webhook Wompi:", error.message);
        console.error("Stack trace:", error.stack);
        
        if (error instanceof SyntaxError) {
            return res.status(400).send("Invalid JSON in webhook body");
        }
        
        return res.status(500).send("Internal server error");
    }
};