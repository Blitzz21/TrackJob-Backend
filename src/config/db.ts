import mysql from "mysql2/promise";
import fs from "fs";

const pool = mysql.createPool({
  host: process.env.AIVEN_HOST,
  port: Number(process.env.AIVEN_PORT),
  user: process.env.AIVEN_USER,
  password: process.env.AIVEN_PASSWORD,
  database: process.env.AIVEN_DB,
  ssl: {
    ca: fs.readFileSync("certs/ca.pem")   // ✅ point to downloaded Aiven CA cert
  }
});

// Test connection
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Connected to Aiven MySQL");
    conn.release();
    
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
})();

export default pool;
