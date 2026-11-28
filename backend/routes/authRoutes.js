import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  findUserByEmail,
  findUserByUsername,
  createUser,
} from "../models/User.js";

const router = express.Router();

function validateRegistration({ name, username, email, password }) {
  if (
    typeof name !== "string" ||
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return "Name, username, email and password are required.";
  }

  const cleanName = name.trim();
  const cleanUsername = username.trim();
  const cleanEmail = email.trim().toLowerCase();

  // Require a real name containing letters; allow common punctuation.
  if (
    cleanName.length < 2 ||
    cleanName.length > 100 ||
    !/^(?=.*\p{L})[\p{L}\p{M} .'-]+$/u.test(cleanName)
  ) {
    return "Enter a valid name containing at least one letter.";
  }

  // Username: 3-20 characters, starts with a letter.
  if (!/^[A-Za-z][A-Za-z0-9_]{2,19}$/.test(cleanUsername)) {
    return "Username must be 3-20 characters, start with a letter, and contain only letters, numbers or underscores.";
  }

  if (
    cleanEmail.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
  ) {
    return "Enter a valid email address.";
  }

  // bcrypt only considers the first 72 bytes of a password.
  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    return "Password must contain at least 8 characters and no more than 72 UTF-8 bytes.";
  }

  return null;
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body || {};

    const validationError = validateRegistration({
      name,
      username,
      email,
      password,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const cleanName = name.trim();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    const existingEmail = await findUserByEmail(cleanEmail);

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const existingUsername = await findUserByUsername(cleanUsername);

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "This username is already taken.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await createUser({
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // The unique indexes remain the final protection against race conditions.
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email or username is already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
});

// LOGIN — existing email/password login remains compatible.
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await findUserByEmail(email.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from .env");
    }

    const token = jwt.sign(
      {
        userId: user.id.toString(),
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
});

export default router;
