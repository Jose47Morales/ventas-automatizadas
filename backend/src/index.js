import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

// Inicializar la aplicación de Express
const app = express();
app.use(cors());
app.use(express.json());

// Configurar la conexión a la base de datos PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USER || "admin",
  password: process.env.POSTGRES_PASSWORD || "admin123",
  database: process.env.POSTGRES_DB || "ventas_auto",
});

// Ruta de prueba
pool.connect()
  .then(() => console.log("Conectado a la base de datos PostgreSQL"))
  .catch((err) => console.error("Error al conectar a la base de datos:", err));

// Endpoint de prueba
app.get("/ping", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            message: "Pong!",
            time: result.rows[0].now,
        });
    } catch (error) {
        console.error("Error al hacer ping a la base de datos:", error);
        res.status(500).send("Error al hacer ping a la base de datos");
    }
});

// Configuración del puerto y arranque del servidor
const PORT = process.env.BACKEND_PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});