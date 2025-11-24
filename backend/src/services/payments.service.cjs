const { pool } = require("../database/db.cjs");

module.exports = {
    getAllPayments: async () => {
        const result = await pool.query('SELECT * FROM payments ORDER BY id DESC');
        return result.rows;
    },

    getPaymentById: async (id) => {
        const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
        return result.rows[0];
    },

    createPayment: async (data) => {
        const { order_id, gateway, confirmation_code, status } = data;

        if(!order_id) throw new Error("order_id is required");

        const insert = await pool.query(
            `INSERT INTO payments 
            (order_id, gateway, confirmation_code, status) 
            VALUES ($1, $2, $3, $4) RETURNING *`,
            [order_id, gateway, confirmation_code, status]
        ); 

        return insert.rows[0];
    },

    updatePayment: async (id, data) => {
        const { order_id, gateway, confirmation_code, status } = data;

        const update = await pool.query(
            `UPDATE payments SET 
                order_id = $1, gateway = $2, confirmation_code = $3, status = $4
            WHERE id = $5 RETURNING *`,
            [order_id, gateway, confirmation_code, status, id]
        );

        return update.rows[0];
    },

    deletePayment: async (id) => {
        const result = await pool.query('DELETE FROM payments WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};