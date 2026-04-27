/* ===================================================
   DATABASE CONFIG — MySQL Connection Pool
   =================================================== */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'banyuanyar_trip',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected to database:', process.env.DB_NAME);
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   Pastikan XAMPP MySQL sudah running dan database sudah dibuat.');
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
