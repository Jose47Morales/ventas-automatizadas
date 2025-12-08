module.exports = (req, res, next) => {
    
    console.log("BODY:", req.body);
    console.log("PARAMS:", req.params);
    console.log("QUERY:", req.query);
    
    const phone =
        req.body.phone ||
        req.body.client_phone ||
        req.params.phone ||
        req.query.phone;

    if (!phone) {
        return res.status(400).json({
            success: false,
            message: "El número de teléfono es requerido."
        });
    }

    const cleaned = String(phone).replace(/\s+/g, "").trim();

    // Validación básica: solo dígitos o + al inicio
    const phoneRegex = /^\+?\d{10,15}$/;

    if (!phoneRegex.test(cleaned)) {
        return res.status(400).json({
            success: false,
            message:
                "El número de teléfono es inválido. Debe contener entre 10 y 15 dígitos y opcionalmente comenzar con '+'."
        });
    }

    // Formato unificado para sistemas internos (quita +)
    req.validatedPhone = cleaned.replace("+", "");

    next();
};