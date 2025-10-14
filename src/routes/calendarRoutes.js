import express from "express";
import {
  connectGoogleCalendar,
  googleCalendarCallback,
} from "../controllers/calendarControllers.js";

const router = express.Router();

router.get("/auth", connectGoogleCalendar);
router.get("/google/calendar/callback", googleCalendarCallback);

export default router;
