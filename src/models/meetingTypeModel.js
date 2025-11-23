import pool from "../config/db";

export const createMeetingType = async (payload) => {
  const {
    tenant_id,
    user_id,
    title,
    description,
    duration_min,
    slug,
    location_type,
  } = payload;

  const result = await pool.query(
    `INSERT INTO meeting_types
     (tenant_id, user_id, title, description, duration_min, slug, location_type)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [tenant_id, user_id, title, description, duration_min, slug, location_type]
  );

  return result.rows[0];
};

export const findMeetingTypeBySlug = async (user_id, slug) => {
  const result = await pool.query(
    `SELECT * FROM meeting_types
     WHERE user_id=$1 AND slug=$2 AND active=true`,
    [user_id, slug]
  );
  return result.rows[0] || null;
};

export const findMeetingTypeById = async (meeting_type_id) => {
  const result = await pool.query(
    "SELECT * FROM meeting_types WHERE meeting_type_id=$1",
    [meeting_type_id]
  );
  return result.rows[0] || null;
};