import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Endpoint para verificación de Meta (GET)
router.get('/webhook/verify', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Meta verification request:', { mode, token, challenge });

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    // Responder exactamente con el challenge (texto plano)
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Invalid verify token');
  }
});

export default router;
