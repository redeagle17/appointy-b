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
        console.log("THE EMAIL IS ---", email);

        const existingUser = await pool.query(
          "SELECT * FROM users WHERE email=$1",
          [email]
        );
        console.log("THE EXISTING USER IS ---", existingUser.rows);
        // If user already exists, return error
        if (existingUser.rows.length > 0) {
          const error = new Error("User already exists");
          error.code = "USER_EXISTS";
          error.user = existingUser.rows[0];
          return done(error, null);
        }

        // Create new user if they don't exist
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

        // Validate that user was created successfully
        if (!newUser.rows || newUser.rows.length === 0) {
          const error = new Error("Failed to create user");
          return done(error, null);
        }

        const createdUser = newUser.rows[0];
        console.log("=== User Created Successfully ===");
        console.log("Created user object:", createdUser);
        console.log("User ID:", createdUser?.user_id);
        console.log("Email:", createdUser?.email);
        console.log("About to call done(null, createdUser)...");

        // Store user in req object for middleware access (workaround for Express 5.x compatibility)
        if (req) {
          req._passportUser = createdUser;
        }

        return done(null, createdUser);
      } catch (err) {
        console.error("Google OAuth error:", err);
        return done(err, null);
      }
    }
  )
);

// Serialization functions (required even with session: false in some Passport versions)
passport.serializeUser((user, done) => {
  console.log("=== Serialize User ===");
  console.log("User being serialized:", user);
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  console.log("=== Deserialize User ===");
  console.log("User ID:", id);
  try {
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      id,
    ]);
    if (result.rows.length > 0) {
      done(null, result.rows[0]);
    } else {
      done(new Error("User not found"), null);
    }
  } catch (err) {
    done(err, null);
  }
});

export default passport;
