import pool from "../config/db.js";

export const createEvent = async ({
  tenant_id,
  user_id,
  meeting_type_id,
  start_datetime,
  end_datetime,
}) => {
  const res = await pool.query(
    `INSERT INTO events
     (tenant_id, user_id, meeting_type_id, start_datetime, end_datetime)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [tenant_id, user_id, meeting_type_id, start_datetime, end_datetime]
  );
  return res.rows[0];
};
