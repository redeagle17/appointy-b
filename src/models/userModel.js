import pool from "../config/db.js";

export const findUserByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = $1";
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

export const createUser = async (tenantId, name, email, hashedPassword, timezone = "UTC") => {
  const query = `
    INSERT INTO users (tenant_id, name, email, password, role, timezone)
    VALUES ($1, $2, $3, $4, 'owner', $5)
    RETURNING user_id, tenant_id, name, email, timezone
  `;
  const result = await pool.query(query, [tenantId, name, email, hashedPassword, timezone]);
  return result.rows[0];
};

export const findUserById = async (user_id) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE user_id=$1",
    [user_id]
  );
  return result.rows[0] || null;
};