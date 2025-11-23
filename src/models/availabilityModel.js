import pool from "../config/db.js";

export const getAvailabilityRuleForDay = async (user_id, day_of_week) => {
  const res = await pool.query(
    "SELECT * FROM availability_rules WHERE user_id=$1 AND day_of_week=$2",
    [user_id, day_of_week]
  );
  return res.rows[0] || null;
};

export const getExceptionsForDate = async (user_id, dateStr) => {
  const res = await pool.query(
    `SELECT * FROM availability_exceptions
     WHERE user_id=$1 
       AND start_datetime::date = $2`,
    [user_id, dateStr]
  );
  return res.rows;
};
