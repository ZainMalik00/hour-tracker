import dayjs from "dayjs";

export interface TimeEntry {
  category: string;
  time: dayjs.Dayjs;
  timezone: string;
} 

export interface DayEntry {
  date: string;
  dayOfWeek: string;
  week: number;
  timeEntries: TimeEntry[] | null;
} 

export interface WeekEntry {
  week: number;
  timeEntries: TimeEntry[] | null;
}

export interface DayOfWeekEntry {
  dayOfWeek: number;
  timeEntries: TimeEntry[] | null;
}

export interface HourlyEntry {
  hour: string;
  timeEntries: TimeEntry[] | null;
}