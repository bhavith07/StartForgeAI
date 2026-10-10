import { getDB } from "../config/db.js";

export async function findUserByEmail(email) {
  const db = getDB();

  const result = await db.query(
    `
    SELECT id, name, email, password, created_at
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
    [email.toLowerCase().trim()]
  );

  return result.rows[0] || null;
}

export async function createUser(user) {
  const db = getDB();

  const result = await db.query(
    `
    INSERT INTO users (name, email, password, created_at)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, password, created_at
    `,
    [
      user.name,
      user.email,
      user.password,
      user.createdAt || new Date(),
    ]
  );

  return result.rows[0];
}