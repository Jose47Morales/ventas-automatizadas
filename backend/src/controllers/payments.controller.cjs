const crypto = require('crypto');
const paymentsService = require("../services/payments.service.cjs");
const ordersService = require("../services/orders.service.cjs");

module.exports = {
    getPayments: async (req, res) => {
        try {
            const payments = await paymentsService.getAllPayments();
            res.json(payments);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    getPayment: async (req, res) => {
        try {
            const { id } = req.params;
            const payment = await paymentsService.getPaymentById(id);
            if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
            res.json(payment);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message }); 
        }
    },

    createPayment: async (req, res) => {
        console.log('req.body', req.body);
        try {
            const payment = await paymentsService.createPayment(req.body);
            res.status(201).json(payment);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },  

    updatePayment: async (req, res) => {
        try {
            const { id } = req.params;
            const payment = await paymentsService.updatePayment(id, req.body);
            if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
            res.json(payment);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    deletePayment: async (req, res) => {
        try {
            const { id } = req.params;  
            const payment = await paymentsService.deletePayment(id);
            if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
            res.json({ success: true, message: 'Payment deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    preparePayment: async (req, res) => {
        try {
            const { order_id } = req.body;

            if (!order_id) {
                return res.status(400).json({ success: false, message: 'order_id is required' });
            }

            const order = await ordersService.getOrderById(order_id);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            if (order.payment_status === 'paid') {
                return res.status(400).json({ success: false, message: 'Order is already paid' });
            }

            const reference = `ORDER-${order.id}-${Date.now()}`;
            const amount = Number(order.total_amount);
            const amountInCents = Math.round(amount * 100);
            const currency = 'COP';

            const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
            const publicKey = process.env.WOMPI_PUBLIC_KEY;
            
            const signature = crypto
                .createHash('sha256')
                .update(
                    `${reference}${amountInCents}${currency}${integritySecret}`
                )
                .digest('hex');
            const client_name = order.client_name || 'Cliente';
            const client_phone = order.client_phone || 'unkknown';

            const params = new URLSearchParams({
                'public-key': publicKey,
                currency,
                'amount-in-cents': amountInCents,
                reference,
                'signature:integrity': signature,
                'redirect-url': process.env.WOMPI_REDIRECT_URL,
                'customer-email': `${client_phone}@whatsapp.temp`,
                'customer-full-name': client_name,
                'customer-phone-number': client_phone,
            });

            const paymentLink = `https://checkout.wompi.co/p/?${params.toString()}`;

            await paymentsService.createPayment({
                order_id: order.id,
                gateway: 'wompi',
                reference,
                status: 'pending',
                amount
            });

            return res.json({
                success: true,
                order_id: order.id,
                from: client_phone,
                userName: client_name,
                reference,
                amount,
                amount_in_cents: amountInCents,
                payment_link: paymentLink
            });

        } catch (error) {
            console.error('Error in preparePayment:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
};