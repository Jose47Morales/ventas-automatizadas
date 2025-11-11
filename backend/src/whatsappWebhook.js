import express from 'express';
const router = express.Router();

// Endpoint para recibir mensajes entrantes desde Meta
router.post('/webhook/verify', express.json(), async (req, res) => {
  try {
    const body = req.body;

    // Confirmar recepción a Meta (debe responder 200 siempre)
    res.sendStatus(200);

    // Loguear el mensaje recibido
    console.log('📩 Mensaje entrante:', JSON.stringify(body, null, 2));

    // Reenviar a n8n (para procesamiento automatizado)
    await fetch('https://launched-recent-peterson-shot.trycloudflare.com/webhook/whatsapp-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (error) {
    console.error('Error reenviando a n8n:', error);
    res.sendStatus(500);
  }
});

export default router;
