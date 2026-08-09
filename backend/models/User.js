import { getDB } from "../config/db.js";

export async function findUserByEmail(email) {
  const db = getDB();

  return await db.collection("users").findOne({
    email: email.toLowerCase(),
  });
}

export async function createUser(user) {
  const db = getDB();

  const result = await db.collection("users").insertOne(user);

  return {
    _id: result.insertedId,
    ...user,
  };
}