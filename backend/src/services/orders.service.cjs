const { pool } = require("../database/db.cjs");

module.exports = {

    // Obtiene todos los pedidos
    getAllOrders: async () => {
        const query = `
            SELECT
                o.*,
                json_agg(
                    json_build_object(
                        'product_id', oi.product_id,
                        'product_name', p.nombre,
                        'quantity', oi.quantity,
                        'unit_price', oi.unit_price,
                        'total', oi.total
                    )
                ) AS items
            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            LEFT JOIN products p ON p.id_producto = oi.product_id
            GROUP BY o.id
            ORDER BY o.id DESC;
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    getOrderById: async (id) => {
        const query = `
            SELECT
                o.*,
                json_agg(
                    json_build_object(
                        'product_id', oi.product_id,
                        'product_name', p.nombre,
                        'quantity', oi.quantity,
                        'unit_price', oi.unit_price,
                        'total', oi.total        
                    )
                ) AS items
            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            LEFT JOIN products p ON p.id_producto = oi.product_id
            WHERE o.id = $1
            GROUP BY o.id;
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    createOrder: async ({ client_name, client_phone, items }) => {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const orderRes = await client.query(
                `INSERT INTO orders (client_name, client_phone, payment_status)
                VALUES ($1, $2, 'pending')
                RETURNING *`,
                [client_name, client_phone]
            );

            const orderId = orderRes.rows[0].id;

            for (const item of items) {
                const qty = Number(item.quantity);
                if (!qty || qty <= 0) throw new Error('Cantidad inválida');

                const productRes = await client.query(
                    `SELECT precioventa_con_impuesto
                    FROM products
                    WHERE id_producto = $1`,
                    [item.product_id]
                );

                if (!productRes.rows.length) {
                    throw new Error('Producto no encontrado');
                }

                const unit_price = Number(productRes.rows[0].precioventa_con_impuesto);

                await client.query(
                    `INSERT INTO order_items
                    (order_id, product_id, quantity, unit_price)
                    VALUES ($1, $2, $3, $4)`,
                    [orderId, item.product_id, qty, unit_price]
                );
            }

            await client.query(`
                UPDATE orders
                SET total = (
                    SELECT COALESCE(SUM(total), 0)
                    FROM order_items
                    WHERE order_id = $1
                )
                WHERE id = $1
            `, [orderId]);

            await client.query('COMMIT');

            return await module.exports.getOrderById(orderId);

        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(error.message);
        } finally {
            client.release();
        }
    },


    updatePaymentStatus: async (order_id, status) => {
        const result = await pool.query(
            `UPDATE orders
            SET payment_status = $1
            WHERE id = $2
            RETURNING *`,
            [status, order_id]
        );
        return result.rows[0];
    },

    deleteOrder: async (id) => {
        const result = await pool.query(
            `DELETE FROM orders WHERE id = $1 RETURNING *`, 
            [id]
        );
        return result.rows[0];
    },

    addItemToOrder: async (order_id, { product_id, quantity }) => {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const qty = Number(quantity);
            if (!qty || qty <= 0) throw new Error('Cantidad inválida');

            const orderRes = await client.query(
                `SELECT id
                FROM orders
                WHERE id = $1`,
                [order_id]
            );

            if (!orderRes.rows.length) {
                throw new Error('Orden no encontrada');
            }

            const productRes = await client.query(
                `SELECT precioventa_con_impuesto
                FROM products
                WHERE id_producto = $1`,
                [product_id]
            );

            if (!productRes.rows.length) {
                throw new Error('Producto no encontrado');
            }

            const unit_price = Number(productRes.rows[0].precioventa_con_impuesto);
            const total = unit_price * qty;

            const itemRes = await client.query(
                `INSERT INTO order_items 
                (order_id, product_id, quantity, unit_price, total)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                [order_id, product_id, qty, unit_price, total]
            );

            await client.query(`
                UPDATE orders
                SET total = (
                    SELECT COALESCE(SUM(total), 0) 
                    FROM order_items 
                    WHERE order_id = $1
                )
                WHERE id = $1`, 
                [order_id]
            );

            await client.query('COMMIT');
            return itemRes.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error('Error adding item to order:' + error.message);
        } finally {
            client.release();
        }
    }
};