const crypto = require("crypto");
const axios = require("axios");
const { pool } = require("../database/db.cjs");

exports.wompiWebhook = async (req, res) => {
    try {
        console.log("Webhook Wompi recibido");
        console.log("Headers:", req.headers);

        const signature = req.headers["x-event-checksum"];

        if (!signature) {
            console.error("No se encontró el header x-event-checksum");
            return res.status(401).send("Invalid signature");
        }

        const rawBody = req.body.toString("utf8");

        console.log("Raw body length:", rawBody.length);
        console.log("Raw body preview:", rawBody.substring(0, 100));

        if (!process.env.WOMPI_EVENTS_SECRET) {
            console.error("WOMPI_EVENTS_SECRET no está configurado");
            return res.status(500).send("Server misconfiguration");
        }

        const expectedSignature = crypto
            .createHash("sha256")
            .update(rawBody + process.env.WOMPI_EVENTS_SECRET)
            .digest("hex");

        console.log("Firma recibida:", signature);
        console.log("Firma esperada:", expectedSignature);
        console.log("¿Firmas coinciden?", signature === expectedSignature);

        if (signature !== expectedSignature) {
            console.error("Firma inválida para el webhook de Wompi");
            console.error("Raw body para firma inválida:", rawBody);
            return res.status(401).send("Invalid signature");
        }

        console.log("Firma verificada correctamente");

        const event = JSON.parse(rawBody);
        console.log("Evento Wompi:", event.event);

        const transaction = event.data.transaction;

        if (!transaction) {
            console.error("No se encontró la transacción en el evento");
            return res.status(400).send("No transaction data");
        }

        const {
            id: wompi_transaction_id,
            status,
            reference,
            amount_in_cents,
            payment_method_type
        } = transaction;

        console.log(`Procesando transacción Wompi ID: ${wompi_transaction_id}, Referencia: ${reference}, Estado: ${status}`);

        await pool.query(
            `
            UPDATE payments
            SET
                status = $1,
                updated_at = now()
            WHERE reference = $2
            `,
            [
                status,
                reference
            ]
        );

        if (process.env.N8N_WEBHOOK_PAYMENTS) {
            await axios.post(process.env.N8N_WEBHOOK_PAYMENTS, {
                provider: "wompi",
                transaction_id: wompi_transaction_id,
                reference,
                status,
                amount: amount_in_cents / 100,
                payment_method: payment_method_type,
                event_type: event.event
            });
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error("Error webhook Wompi: ", error);
        return res.status(500).send("Webhook error");
    }
};