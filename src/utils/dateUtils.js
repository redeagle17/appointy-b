import { DateTime } from "luxon";

export const parseDate = (dateStr, timezone = "UTC") =>
  DateTime.fromISO(dateStr, { zone: timezone });

export const toUTC = (dt) => dt.setZone("UTC");
export const fromUTC = (isoStr, timezone) =>
  DateTime.fromISO(isoStr, { zone: "UTC" }).setZone(timezone);
