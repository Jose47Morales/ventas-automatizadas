const { pool } = require("../database/db.cjs");

module.exports = {
    getAllOrders: async () => {
        const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
        return result.rows;
    },

    getOrderById: async (id) => {
        const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
        return result.rows[0];
    },

    createOrder: async ({ client_name, client_phone, product_id, quantity}) => {
        const productRes = await pool.query('SELECT precio FROM products WHERE id_producto = $1', [product_id]);
        if (productRes.rows.length === 0) throw new Error('Producto no encontrado');

        const price = parseFloat(productRes.rows[0].precio);
        const total = price * quantity;

        const insert = await pool.query(
            `INSERT INTO orders 
            (client_name, client_phone, product_id, quantity, total) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [client_name, client_phone, product_id, quantity, total]
        );

        return insert.rows[0];
    },

    updateOrder: async (id, { client_name, client_phone, product_id, quantity, payment_status }) => {
        const update = await pool.query(
            `UPDATE orders SET 
                client_name = $1,
                client_phone = $2,
                product_id = $3,
                quantity = $4,
                payment_status = $5
            WHERE id = $6 RETURNING *`,
            [client_name, client_phone, product_id, quantity, payment_status, id]
        );
        return update.rows[0];
    },

    deleteOrder: async (id) => {
        const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};