import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

export const getOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URL
  );
};
