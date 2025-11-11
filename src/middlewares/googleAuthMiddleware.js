// import passport from "passport";

// /**
//  * Middleware to handle Google OAuth authentication via Passport
//  * Handles both login and signup cases cleanly.
//  */
// export const googleAuthMiddleware = (req, res, next) => {
//   const authenticate = passport.authenticate("google", { session: false });

//   authenticate(req, res, (err, user, info) => {

//     if (!user && req._passportUser) {
//       console.log("Using fallback user from req._passportUser");
//       user = req._passportUser;
//     }

//     if (err && err.code === "USER_EXISTS") {
//       console.warn("Signup failed — user already exists");
//       return res.status(409).json({
//         error: "User already exists. Please log in instead.",
//         type: "USER_EXISTS",
//       });
//     }

//     if (err && err.code === "USER_NOT_FOUND") {
//       console.warn("Login failed — user not found");
//       return res.status(404).json({
//         error: "User not found. Please sign up first.",
//         type: "USER_NOT_FOUND",
//       });
//     }

//     if (err) {
//       console.error("Passport authentication error:", err);
//       return res.status(500).json({
//         error: "Authentication failed",
//         details: err.message,
//       });
//     }

//     if (!user) {
//       return res.status(401).json({
//         error: "Authentication failed - no user returned",
//       });
//     }

//     console.log("Google OAuth authentication successful:", user.email);
//     req.user = user;
//     next();
//   });
// };
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
