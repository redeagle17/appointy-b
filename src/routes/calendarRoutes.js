import express from "express";
import {
  connectGoogleCalendar,
  googleCalendarCallback,
} from "../controllers/calendarControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/auth", authMiddleware, connectGoogleCalendar);
router.get("/google/calendar/callback", googleCalendarCallback);

export default router;
