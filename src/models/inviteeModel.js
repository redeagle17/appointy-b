import pool from "../config/db.js";

export const createInvitee = async ({ event_id, name, email }) => {
  const res = await pool.query(
    `INSERT INTO event_invitees (event_id, name, email)
     VALUES ($1,$2,$3)
     RETURNING *`,
    [event_id, name, email]
  );
  return res.rows[0];
};
