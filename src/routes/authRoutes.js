import express from "express";
import {
  signup,
  login,
  refreshToken,
  logout,
} from "../controllers/authControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", authMiddleware, refreshToken);
router.post("/logout", authMiddleware, logout);

export default router;
