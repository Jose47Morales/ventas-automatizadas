module.exports = (req, res, next) => {
    const { id } = req.params;

    // Validar existencia
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "El parámetro 'id' es requerido"
        });
    }

    // Validar que sea número entero positivo
    const parsedId = Number(id);

    if (isNaN(parsedId) || !Number.isInteger(parsedId) || parsedId <= 0) {
        return res.status(400).json({
            success: false,
            message: "El parámetro 'id' debe ser un número entero positivo"
        });
    }

    // ID válido → continúa el flujo
    next();
};