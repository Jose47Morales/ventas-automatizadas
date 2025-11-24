const paymentsService = require("../services/payments.service.cjs");

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
    }
};