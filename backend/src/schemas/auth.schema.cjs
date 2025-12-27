module.exports.registerSchema = {
    type: "object",
    required: ["email", "password", "firstName", "lastName"],
    properties: {
        firstName: { type: "string", minLength: 2 },
        lastName: { type: "string", minLength: 2 },
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 6 }
    },
    additionalProperties: false
};

module.exports.loginSchema = {
    type: "object",
    required: ["email", "password"],
    properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 6 }
    },
    additionalProperties: false
};

module.exports.refreshTokenSchema = {
    type: "object",
    required: ["refreshToken"],
    properties: {
        refreshToken: { type: "string", minLength: 20 }
    },
    additionalProperties: false
};