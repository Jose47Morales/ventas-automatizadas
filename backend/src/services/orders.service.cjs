const { pool } = require("../database/db.cjs");

module.exports = {
    getAllOrders: async () => {
        try {
            const result = await pool.query(
                `SELECT o.*, p.nombre AS product_name 
                FROM orders o
                LEFT JOIN products p ON o.product_id = p.id_producto
                ORDER BY o.id DESC`  
            );
            return result.rows;
        } catch (error) {
            throw new Error('Error fetching orders:' + error.message);
        }
    },

    getOrderById: async (id) => {
        try {
            const result = await pool.query(
                `SELECT o.*, p.nombre AS product_name 
                FROM orders o
                LEFT JOIN products p ON o.product_id = p.id_producto
                WHERE o.id = $1`,
                [id]
            );
            return result.rows[0];
        } catch (error) {
            throw new Error('Error fetching order by ID:' + error.message);
        }        
    },

    createOrder: async ({ client_name, client_phone, product_id, quantity}) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Validación inicial
            const qty = Number(quantity);
            if (!qty || qty <= 0) throw new Error('Cantidad inválida');

            const productRes = await client.query(
                `SELECT precioventa_con_impuesto
                FROM products
                WHERE id_producto = $1`,
                [product_id]
            );

            if (productRes.rows.length === 0) {
                throw new Error('Producto no encontrado');
            }

            const price = parseFloat(productRes.rows[0].precioventa_con_impuesto);
            const total = price * qty;

            const insert = await client.query(
                `INSERT INTO orders 
                (client_name, client_phone, product_id, quantity, total, payment_status) 
                VALUES ($1, $2, $3, $4, $5, 'pending') 
                RETURNING *`,
                [client_name, client_phone, product_id, qty, total]
            );

            await client.query('COMMIT');
            return insert.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error('Error creating order:' + error.message);
        } finally {
            client.release();
        }
    },

    updateOrder: async (id, data) => {
        const { client_name, client_phone, product_id, quantity, payment_status } = data;

        try {
            const result = await pool.query(
            `UPDATE orders SET 
                client_name = COALESCE($1, client_name),
                client_phone = COALESCE($2, client_phone),
                product_id = COALESCE($3, product_id),
                quantity = COALESCE($4, quantity),
                payment_status = COALESCE($5, payment_status)
            WHERE id = $6 
            RETURNING *`,
            [
                client_name || null, 
                client_phone || null, 
                product_id || null, 
                quantity || null, 
                payment_status || null, 
                id
            ]
        );
        return result.rows[0];

    } catch (error) {
        throw new Error('Error updating order:' + error.message);
    }   
},

    deleteOrder: async (id) => {
        try {
            const result = await pool.query(
                `DELETE FROM orders WHERE id = $1 RETURNING *`, 
                [id]
            );
            return result.rows[0];
        } catch (error) {
            throw new Error('Error deleting order:' + error.message);
        }
    }
};