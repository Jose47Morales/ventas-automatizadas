import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection  } from "./database/db.js";
import verifyRouter from "./verifyWebhook.js";
import whatsappRouter from "./whatsappWebhook.js";

dotenv.config();

// Inicializar la aplicación de Express
const app = express();
app.use(cors());
app.use(express.json());
app.use('/', verifyRouter);
app.use('/', whatsappRouter);

// Endpoint de prueba
app.get('/ping', (req, res) => {
    res.json({
        message: "Pong!"
    });
});

testConnection();

// Configuración del puerto y arranque del servidor
const PORT = process.env.BACKEND_PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});