import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pool from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;

        const existingUser = await pool.query(
          "SELECT * FROM users WHERE email=$1",
          [email]
        );

        let user;
        if (existingUser.rows.length > 0) {
          user = existingUser.rows[0];
        } else {
          const tenantRes = await pool.query(
            "INSERT INTO tenants(name) VALUES($1) RETURNING tenant_id",
            [name || email.split("@")[0]]
          );
          const tenantId = tenantRes.rows[0].tenant_id;

          const newUser = await pool.query(
            `INSERT INTO users (tenant_id, name, email, password)
             VALUES ($1, $2, $3, NULL)
             RETURNING *`,
            [tenantId, name, email]
          );

          user = newUser.rows[0];
        }

        return done(null, user);
      } catch (err) {
        console.error("Google OAuth error:", err);
        return done(err, null);
      }
    }
  )
);

export default passport;
