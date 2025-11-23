import express from 'express';
import { pool } from '../database/db.cjs';

const router = express.Router();

// Register a new order
router.post('/', async (req, res) => {
    try {
        const { client_name, client_phone, product_id, quantity, total, payment_status } = req.body;

        const result = await pool.query(
            'INSERT INTO orders (client_name, client_phone, product_id, quantity, total, payment_status, date) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id',
            [client_name, client_phone, product_id, quantity, total, payment_status]
        );

        res.status(201).json({ success: true, orderId: result.rows[0].id });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;