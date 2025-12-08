const ajv = require("./ajv.cjs");

module.exports = (schema) => {
    const validate = ajv.compile(schema);

    return (req, res, next) => {
        const valid = validate(req.body);
        
        if (!valid) {
            return res.status(400).json({
                error: "Invalid JSON payload",
                details: validate.errors.map(err => ({
                    field: err.instancePath || err.params.missingProperty || '',
                    message: err.message
                }))
            });
        }

        next();
    };
};