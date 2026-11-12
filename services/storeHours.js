const DEFAULT_TIMEZONE = "America/Chicago";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toMinutes = (time) => {
  const [hours, minutes] = String(time || "").split(":").map(Number);
  return hours * 60 + minutes;
};

// Current weekday (0 = Sunday) and minutes since midnight in the given timezone.
const getNowInTimezone = (timezone, date = new Date()) => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || DEFAULT_TIMEZONE,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date);
    const get = (type) => parts.find((part) => part.type === type)?.value;
    return {
      day: WEEKDAYS.indexOf(get("weekday")),
      minutes: Number(get("hour")) * 60 + Number(get("minute")),
    };
  } catch {
    return { day: date.getDay(), minutes: date.getHours() * 60 + date.getMinutes() };
  }
};

// Returns null when the store has no hours set, otherwise { isOpen, todayHours }.
// Handles overnight ranges (e.g. 18:00 - 02:00) by also checking yesterday's range.
export const getStoreOpenStatus = (store, date = new Date()) => {
  const hours = store?.openingHours;
  if (!Array.isArray(hours) || hours.length === 0) return null;

  const { day, minutes } = getNowInTimezone(store?.timezone, date);
  const today = hours.find((entry) => entry.day === day);
  const yesterday = hours.find((entry) => entry.day === (day + 6) % 7);

  let isOpen = false;
  if (today && !today.isClosed) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    isOpen = open < close ? minutes >= open && minutes < close : minutes >= open;
  }
  if (!isOpen && yesterday && !yesterday.isClosed) {
    const open = toMinutes(yesterday.open);
    const close = toMinutes(yesterday.close);
    if (close < open) isOpen = minutes < close;
  }

  return { isOpen, todayHours: today || null };
};

export const formatTime = (time, locale = "en-US") => {
  const [hours, minutes] = String(time || "").split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return "";
  const date = new Date(2000, 0, 1, hours, minutes);
  return date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
};
