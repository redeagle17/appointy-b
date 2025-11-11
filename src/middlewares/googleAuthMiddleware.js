import passport from "passport";

/**
 * Middleware to handle Google OAuth authentication via Passport.
 * Handles both login and signup cases gracefully.
 */
export const googleAuthMiddleware = (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err && err.code === "USER_EXISTS") {
      console.warn("Signup failed — user already exists");
      return res.redirect(
        `${process.env.FRONTEND_URL}/signup?error=USER_EXISTS`
      );
    }

    if (err && err.code === "USER_NOT_FOUND") {
      console.warn("Login failed — user not found");
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=USER_NOT_FOUND`
      );
    }

    if (err) {
      console.error("Passport authentication error:", err);
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=AUTH_FAILED`
      );
    }

    if (!user) {
      console.error("No user returned from passport");
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=NO_USER`
      );
    }

    console.log("✅ Google OAuth authentication successful:", user.email);
    req.user = user;
    next();
  })(req, res, next);
};
