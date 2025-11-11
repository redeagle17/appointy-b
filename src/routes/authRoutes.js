import express from "express";
import {
  signup,
  login,
  refreshToken,
  logout,
  googleAuthCallback,
} from "../controllers/authControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { googleAuthMiddleware } from "../middlewares/googleAuthMiddleware.js";
import passport from "passport";
import "../config/passport.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", authMiddleware, refreshToken);
router.post("/logout", authMiddleware, logout);
router.get("/google", (req, res, next) => {
  const mode = req.query.mode || "login";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state: mode, 
    prompt: 'select_account',
  })(req, res, next);
});
router.get("/google/callback", googleAuthMiddleware, googleAuthCallback);

export default router;
