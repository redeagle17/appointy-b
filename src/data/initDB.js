import fs from "fs";
import path from "path";
import pool from "../config/db.js";

const __dirname = path.resolve();
const schemaPath = path.join(__dirname, "src", "data", "schema.sql");

export const initDB = async () => {
  try {
    const sql = fs.readFileSync(schemaPath, "utf-8");
    console.log("🚀 Executing schema.sql...");
    await pool.query(sql);
    console.log("✅ Database initialized successfully (no duplicates created)");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};
