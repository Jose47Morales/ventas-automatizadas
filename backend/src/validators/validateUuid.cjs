const { validate: isUuid } = require('uuid');

module.exports = (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "El parámetro 'id' es requerido"
        });
    }

    if (!isUuid(id)) {
        return res.status(400).json({
            success: false,
            message: "El parámetro 'id' debe ser un UUID válido"
        });
    }

    next();
};