const express = require("express");
const router = express.Router();

const analyticsController = require("../controllers/analytics.controller.cjs");

// Crear métrica
router.post("/", analyticsController.createMetric);

// Obtener todas
router.get("/", analyticsController.getAllMetrics);

// Obtener métricas por tipo
router.get("/:metric_type", analyticsController.getMetricsByType);

module.exports = router;