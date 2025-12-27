const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', res.rows[0]);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
};

module.exports = { pool, testConnection };