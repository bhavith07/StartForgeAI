import { getDB } from "../config/db.js";

export async function findUserByEmail(email) {
  const db = getDB();

  const result = await db.query(
    `
    SELECT id, name, email, username, password, created_at
    FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1
    `,
    [email.trim()]
  );

  return result.rows[0] || null;
}

export async function findUserByUsername(username) {
  const db = getDB();

  const result = await db.query(
    `
    SELECT id, name, email, username
    FROM users
    WHERE LOWER(username) = LOWER($1)
    LIMIT 1
    `,
    [username.trim()]
  );

  return result.rows[0] || null;
}

export async function createUser(user) {
  const db = getDB();

  const result = await db.query(
    `
    INSERT INTO users (name, email, username, password, created_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, email, username, created_at
    `,
    [
      user.name,
      user.email,
      user.username,
      user.password,
      user.createdAt || new Date(),
    ]
  );

  return result.rows[0];
}
