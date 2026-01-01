const crypto = require("crypto");
const axios = require("axios");
const { pool } = require("../database/db.cjs");

exports.wompiWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-event-checksum"];
        const rawBody = req.body.toString("utf8");

        const expectedSignature = crypto
            .createHash("sha256")
            .update(rawBody + process.env.WOMPI_EVENTS_SECRET)
            .digest("hex");

        if (signature !== expectedSignature) {
            console.error("❌ Firma inválida Wompi");
            return res.status(401).send("Invalid signature");
        }

        const event = JSON.parse(rawBody);
        const transaction = event.data.transaction;

        const {
            id: wompi_transaction_id,
            status,
            reference,
            amount_in_cents,
            payment_method_type
        } = transaction;

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