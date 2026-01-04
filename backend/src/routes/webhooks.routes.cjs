const express = require('express');
const router = express.Router();
const rawBodyMiddleware = require('../middlewares/rawBody.cjs');
const whatsappWebhook = require('../webhooks/whatsapp.webhook.cjs');
const wompiWebhook = require('../webhooks/wompi.webhook.cjs');

router.get('/whatsapp', whatsappWebhook.verifyWebhook);
router.post('/whatsapp', rawBodyMiddleware, express.json(), whatsappWebhook.receiveMessage);

router.post('/wompi', wompiWebhook.wompiWebhook);

module.exports = router;