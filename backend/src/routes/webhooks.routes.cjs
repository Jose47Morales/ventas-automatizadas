const express = require('express');
const router = express.Router();

const whatsappWebhook = require('../webhooks/whatsapp.webhook.cjs');

router.get('/whatsapp', whatsappWebhook.verifyWebhook);
router.post('/whatsapp', whatsappWebhook.receiveMessage);

module.exports = router;