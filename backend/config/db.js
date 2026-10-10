import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const requiredVariables = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    console.error(
      `❌ Missing environment variable: ${variable}`
    );
  }
}

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.on("error", (error) => {
  console.error("❌ Unexpected PostgreSQL pool error:", error.message);
});

export async function connectDB() {
  try {
    for (const variable of requiredVariables) {
      if (!process.env[variable]) {
        throw new Error(
          `${variable} is missing or empty in backend/.env`
        );
      }
    }

    const client = await pool.connect();

    console.log("✅ PostgreSQL connected successfully");

    client.release();
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:");
    console.error(error.message);
    throw error;
  }
}

export function getDB() {
  return pool;
}

export default pool;
