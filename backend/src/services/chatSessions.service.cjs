const { pool } = require("../database/db.cjs");

module.exports = {
  saveSession: async ({ user_phone, state, data }) => {
    const result = await pool.query(
      `INSERT INTO chat_sessions (user_phone, state, data, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_phone)
       DO UPDATE SET state = $2, data = $3, updated_at = NOW()
       RETURNING *`,
      [user_phone, state, data || null]
    );
    return result.rows[0];
  },

  getSession: async (user_phone) => {
    const result = await pool.query(
      `SELECT * FROM chat_sessions WHERE user_phone = $1`,
      [user_phone]
    );
    return result.rows[0] || null;
  }
};
