import dotenv from "dotenv";

dotenv.config();

import cors from "cors";
import express from "express";

import analyzeRoutes from "./routes/analyzeRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import { connectDB } from "./config/db.js";

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/analyze", analyzeRoutes);
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "StartForge AI Backend Running 🚀",
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
  }
}

startServer();