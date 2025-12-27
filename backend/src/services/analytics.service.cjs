const { pool } = require("../database/db.cjs");

module.exports = {
  // Crear un registro de analytics
  createMetric: async ({ metric_type, value }) => {
    const result = await pool.query(
      `INSERT INTO analytics (metric_type, value)
       VALUES ($1, $2)
       RETURNING *`,
      [metric_type, value]
    );
    return result.rows[0];
  },

  // Obtener todos los registros
  getAllMetrics: async () => {
    const result = await pool.query(
      `SELECT * FROM analytics ORDER BY created_at DESC`
    );
    return result.rows;
  },

  // Obtener métricas por tipo
  getMetricsByType: async (metric_type) => {
    const result = await pool.query(
      `SELECT * FROM analytics WHERE metric_type = $1 ORDER BY created_at DESC`,
      [metric_type]
    );
    return result.rows;
  }
};