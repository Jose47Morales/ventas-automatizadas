const { pool } = require("../database/db.cjs");

module.exports = {
    getAllPayments: async () => {
        const result = await pool.query('SELECT * FROM payments ORDER BY created_at DESC');
        return result.rows;
    },

    getPaymentById: async (id) => {
        const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
        return result.rows[0];
    },

    createPayment: async (data) => {
        const { order_id, gateway, payment_link, reference, status, amount } = data;

        if(!order_id) throw new Error("order_id is required");

        const insert = await pool.query(
            `INSERT INTO payments 
            (order_id, gateway, payment_link, reference, status, amount) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [order_id, gateway, payment_link || null, reference || null, status, amount]
        ); 

        return insert.rows[0];
    },

    updatePayment: async (id, data) => {
        const { gateway, payment_link, reference, status, amount } = data;

        const update = await pool.query(
            `UPDATE payments SET 
                gateway = $1, payment_link = $2, reference = $3, status = $4, amount = $6
            WHERE id = $7 RETURNING *`,
            [gateway, payment_link, reference, status, amount, id]
        );

        return update.rows[0];
    },

    deletePayment: async (id) => {
        const result = await pool.query('DELETE FROM payments WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};