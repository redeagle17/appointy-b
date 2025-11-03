import passport from "passport";

/**
 * Middleware to handle Google OAuth authentication via Passport
 * Checks if user already exists and returns appropriate error
 */
export const googleAuthMiddleware = (req, res, next) => {
  const authenticate = passport.authenticate("google", {
    session: false,
  });

  authenticate(req, res, (err, user, info) => {
    if (!user && req._passportUser) {
      console.log("Using workaround: getting user from req._passportUser");
      user = req._passportUser;
    }

    // Handle custom error for existing users
    if (err && err.code === "USER_EXISTS") {
      return res.status(409).json({ error: "User already exists" });
    }

    // Handle other errors
    if (err) {
      console.error("Passport authentication error:", err);
      return res
        .status(500)
        .json({ error: "Authentication failed", details: err.message });
    }

    // Check if user exists
    if (!user) {
      return res
        .status(401)
        .json({ error: "Authentication failed - no user returned" });
    }

    // If authentication succeeded, attach user to req and proceed
    console.log("Authentication successful, user:", user);
    req.user = user;
    next();
  });
};
