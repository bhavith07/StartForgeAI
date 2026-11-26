
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

export async function connectDB() {
  try {
    if (
      !process.env.DATABASE_URL &&
      (!process.env.DB_USER ||
        !process.env.DB_PASSWORD ||
        !process.env.DB_NAME)
    ) {
      throw new Error("Database environment variables are missing.");
    }

    const client = await pool.connect();

    console.log("PostgreSQL connected successfully");

    client.release();
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
    throw error;
  }
}

export function getDB() {
  return pool;
}

export default pool;
