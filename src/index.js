import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import { initDB } from "./data/initDB.js";
import passport from "passport";
import "./config/passport.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
    ],
    credentials: true, // allow cookies (required for JWT httpOnly cookies)
  })
);
app.use(express.json());
app.use(passport.initialize());

const initializeDatabase = async () => {
  if (process.env.INIT_DB === "true") {
    console.log("⚙️ INIT_DB flag is true — initializing database...");
    await initDB();
  } else {
    console.log("⏭️ Skipping DB initialization (INIT_DB flag not set)");
  }
};

app.use(cookieParser());

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Database connected", time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection error" });
  }
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Server failed to start:", err);
    process.exit(1);
  });

import authRoutes from "./routes/authRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/calendar", calendarRoutes);