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
      passReqToCallback: true, // gives us access to req.query.state (our mode)
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const mode = req.query.state || "login"; // either "signup" or "login"
        console.log("🌀 Google OAuth Mode:", mode);
        console.log("📧 Email:", email);

        // 1️⃣ Check if user already exists
        const existingUserResult = await pool.query(
          "SELECT * FROM users WHERE email=$1",
          [email]
        );
        const existingUser = existingUserResult.rows[0];

        // 2️⃣ Handle based on mode
        if (mode === "signup") {
          if (existingUser) {
            const error = new Error("User already exists");
            error.code = "USER_EXISTS";
            req.authError = "USER_EXISTS";
            return done(error, null);
          }

          // Create a new tenant for the user
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

          const createdUser = newUser.rows[0];
          console.log("✅ New user created:", createdUser.email);

          if (req) req._passportUser = createdUser;
          return done(null, createdUser);
        }

        if (mode === "login") {
          if (!existingUser) {
            const error = new Error("User not found");
            error.code = "USER_NOT_FOUND";
            return done(error, null);
          }

          console.log("✅ Existing user logged in:", existingUser.email);
          if (req) req._passportUser = existingUser;
          return done(null, existingUser);
        }

        // 3️⃣ Default fallback
        console.warn("⚠️ Unknown mode received, defaulting to login.");
        if (existingUser) {
          return done(null, existingUser);
        } else {
          const error = new Error("User not found");
          error.code = "USER_NOT_FOUND";
          req.authError = "USER_NOT_FOUND";
          return done(error, null);
        }
      } catch (err) {
        console.error("🔥 Google OAuth error:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE user_id=$1", [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
