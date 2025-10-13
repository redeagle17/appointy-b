import express from "express";
import {
  signup,
  login,
  refreshToken,
  logout,
  googleAuthCallback,
} from "../controllers/authControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import passport from "passport";
import "../config/passport.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", authMiddleware, refreshToken);
router.post("/logout", authMiddleware, logout);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5143/",
  }),
  googleAuthCallback
);

export default router;
