module.exports = (req, res, next) => {
    const { quantity, payment_status } = req.body;

    if (quantity !== undefined && (isNaN(quantity) || Number(quantity) <= 0)) {
        return res.status(400).json({ success: false, message: "quantity debe ser un número mayor a 0" });
    }

    if (payment_status && !["pending", "paid", "cancelled"].includes(payment_status)) {
        return res.status(400).json({ success: false, message: "payment_status inválido" });
    }

    next();
};