const UK_TIME_ZONE = "Europe/London";

type UkClock = {
  weekday: string;
  hour: number;
  minute: number;
};

function ukClock(date: Date): UkClock {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: UK_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    weekday: value("weekday"),
    hour: Number(value("hour")),
    minute: Number(value("minute")),
  };
}

export function isUkQuietHours(date = new Date()): boolean {
  const { weekday, hour, minute } = ukClock(date);
  const minutes = hour * 60 + minute;

  return (weekday === "Fri" && minutes >= 18 * 60)
    || (weekday === "Sat" && minutes < 22 * 60);
}

export const QUIET_HOURS_SCHEDULE = "Friday 6:00 PM to Saturday 10:00 PM (UK time)";