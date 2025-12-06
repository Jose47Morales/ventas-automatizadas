module.exports = (req, res, next) => {
    const { client_name, client_phone, product_id, quantity } = req.body;

    if (!client_name || typeof client_name !== "string") {
        return res.status(400).json({ success: false, message: "client_name es requerido" });
    }
    if (!client_phone || client_phone.length < 6) {
        return res.status(400).json({ success: false, message: "client_phone inválido" });
    }
    if (!product_id || isNaN(product_id)) {
        return res.status(400).json({ success: false, message: "product_id inválido" });
    }
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
        return res.status(400).json({ success: false, message: "quantity debe ser mayor a 0" });
    }

    next();
};