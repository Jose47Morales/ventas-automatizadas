const analyticsService = require("../services/analytics.service.cjs");

module.exports = {
  // POST /analytics
  createMetric: async (req, res) => {
    try {
      const { metric_type, value } = req.body;

      if (!metric_type || value === undefined) {
        return res.status(400).json({
          error: "metric_type y value son obligatorios"
        });
      }

      const metric = await analyticsService.createMetric({ metric_type, value });
      return res.json(metric);

    } catch (error) {
      console.error("Error creando métrica:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },

  // GET /analytics
  getAllMetrics: async (_req, res) => {
    try {
      const data = await analyticsService.getAllMetrics();
      res.json(data);
    } catch (error) {
      console.error("Error obteniendo métricas:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },

  // GET /analytics/:metric_type
  getMetricsByType: async (req, res) => {
    try {
      const { metric_type } = req.params;
      const data = await analyticsService.getMetricsByType(metric_type);

      res.json(data);

    } catch (error) {
      console.error("Error obteniendo métricas por tipo:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
};