/* ===================================================
   DATABASE CONFIG — MySQL Connection Pool
   Supports both individual env vars (local) and
   MYSQL_URL connection string (Railway)
   =================================================== */
const mysql = require('mysql2/promise');
require('dotenv').config();

// Railway provides MYSQL_URL as a single connection string
// Local dev uses individual DB_* environment variables
const poolConfig = process.env.MYSQL_URL
  ? {
      uri: process.env.MYSQL_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'banyuanyar_trip',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

const pool = mysql.createPool(poolConfig);

// Test connection
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    if (!process.env.MYSQL_URL) {
      console.error('   Pastikan XAMPP MySQL sudah running dan database sudah dibuat.');
    }
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
