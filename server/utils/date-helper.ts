import { DatePeriod } from "../enums/utils-enums.js";
import { IDateRange } from "../types/utils-interfaces.js";

// GET START OF DAY (00:00:00.000)
export const getStartOfDay = (date: Date = new Date()): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

// GET END OF DAY (23:59:59.999)
export const getEndOfDay = (date: Date = new Date()): Date => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

// GET START OF WEEK (Monday 00:00:00.000)
export const getStartOfWeek = (date: Date = new Date()): Date => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

// GET END OF WEEK (Sunday 23:59:59.999)
export const getEndOfWeek = (date: Date = new Date()): Date => {
  const end = new Date(date);
  const day = end.getDay();
  const diff = end.getDate() + (day === 0 ? 0 : 7 - day);
  end.setDate(diff);
  end.setHours(23, 59, 59, 999);
  return end;
};

// GET START OF MONTH (1st day 00:00:00.000)
export const getStartOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
};

// GET END OF MONTH (Last day 23:59:59.999)
export const getEndOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

// GET START OF YEAR (Jan 1st 00:00:00.000)
export const getStartOfYear = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
};

// GET END OF YEAR (Dec 31st 23:59:59.999)
export const getEndOfYear = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
};

// GET DATE RANGE BY PERIOD
export const getDateRangeByPeriod = (
  period: DatePeriod | string,
  customStart?: Date
): IDateRange => {
  const now = new Date();

  switch (period) {
    case DatePeriod.TODAY:
      return {
        startDate: getStartOfDay(now),
        endDate: getEndOfDay(now),
      };

    case DatePeriod.WEEK:
      return {
        startDate: getStartOfWeek(now),
        endDate: getEndOfWeek(now),
      };

    case DatePeriod.MONTH:
      return {
        startDate: getStartOfMonth(now),
        endDate: getEndOfMonth(now),
      };

    case DatePeriod.YEAR:
      return {
        startDate: getStartOfYear(now),
        endDate: getEndOfYear(now),
      };

    case DatePeriod.ALL:
      return {
        startDate: customStart || new Date("2025-01-01"),
        endDate: getEndOfDay(now),
      };

    default:
      return {
        startDate: getStartOfDay(now),
        endDate: getEndOfDay(now),
      };
  }
};

// GET DAYS BETWEEN TWO DATES
export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ADD DAYS TO DATE
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// ADD HOURS TO DATE
export const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

// FORMAT DATE TO ISO STRING (WITHOUT TIMEZONE)
export const formatDateToISO = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// FORMAT DATETIME TO ISO STRING
export const formatDateTimeToISO = (date: Date): string => {
  return date.toISOString();
};

// CHECK IF DATE IS TODAY
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// CHECK IF DATE IS IN PAST
export const isPast = (date: Date): boolean => {
  return date < new Date();
};

// CHECK IF DATE IS IN FUTURE
export const isFuture = (date: Date): boolean => {
  return date > new Date();
};

// GET READABLE TIME AGO STRING
export const getTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval} year${interval > 1 ? "s" : ""} ago`;

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} month${interval > 1 ? "s" : ""} ago`;

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} day${interval > 1 ? "s" : ""} ago`;

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} hour${interval > 1 ? "s" : ""} ago`;

  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} minute${interval > 1 ? "s" : ""} ago`;

  return `${Math.floor(seconds)} second${seconds !== 1 ? "s" : ""} ago`;
};

// PARSE DATE STRING TO DATE OBJECT
export const parseDate = (dateString: string): Date | null => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// GET HOUR OF DAY (0-23)
export const getHourOfDay = (date: Date): number => {
  return date.getHours();
};

// GET DAY OF WEEK (0-6, Sunday = 0)
export const getDayOfWeek = (date: Date): number => {
  return date.getDay();
};

// GET MONTH OF YEAR (0-11, January = 0)
export const getMonthOfYear = (date: Date): number => {
  return date.getMonth();
};
