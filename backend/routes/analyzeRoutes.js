import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  const data = req.body;

  console.log("Received:", data);

  res.json({
    success: true,
    message: "Idea received successfully!",
    data,
  });
});

export default router;