import { google } from "googleapis";
import pool from "../config/db.js";
import { getOAuthClient } from "../config/googleCalendar.js";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile"
];

export const connectGoogleCalendar = async (req, res) => {
  try {
    const oauth2Client = getOAuthClient();

    const user_id = req.user.user_id;
    if (!user_id) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: SCOPES,
      state: user_id,
    });

    if (req.headers.accept?.includes("application/json")) {
      return res.json({ authUrl });
    }

    return res.redirect(authUrl);
  } catch (error) {
    console.error("Error generating Google OAuth URL:", error);
    res.status(500).json({ error: "Failed to generate Google Auth URL" });
  }
};

export const googleCalendarCallback = async (req, res) => {
  const { code, state } = req.query;
  const oauth2Client = getOAuthClient();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const { data: profile } = await oauth2.userinfo.get();

    await pool.query(
      `UPDATE users 
       SET google_calendar_access_token=$1,
           google_calendar_refresh_token=$2,
           google_calendar_token_expires=to_timestamp($3),
           google_calendar_connected=true,
           google_calendar_email=$4
       WHERE user_id=$5`,
      [
        tokens.access_token,
        tokens.refresh_token,
        tokens.expiry_date / 1000,
        profile.email,
        state
      ]
    );
    
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (err) {
    console.error("Google Calendar connection error:", err);
    res.status(500).json({ error: "Failed to connect calendar" });
  }
};
