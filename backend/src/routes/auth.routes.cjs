const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers/auth.controller.cjs');
const validateSchema = require("../validators/validateSchema.cjs");
const { registerSchema, loginSchema, refreshTokenSchema } = require("../schemas/auth.schema.cjs");

router.post('/login', validateSchema(loginSchema), authCtrl.login);

router.post('/register', validateSchema(registerSchema), authCtrl.register);

router.post('/refresh-token', validateSchema(refreshTokenSchema), authCtrl.refreshToken);

module.exports = router;