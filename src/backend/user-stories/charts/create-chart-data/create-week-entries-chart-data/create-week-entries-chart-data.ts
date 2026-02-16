import { DayOfWeekEntry, HourlyEntry, WeekEntry } from "../../../../entities/Entries";
import { CategoryEntry } from "../../../../entities/DefaultCategories";
import { ChartType } from "../../../../services/chart-service";
import dayjs from "dayjs";

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as const;

export const CreateWeekEntriesChartData = (category: string, type: "total" | "average", weekEntries: any[], userCategories: CategoryEntry[], selectedDate: number): { xData: number[]; yData: number[] } => {
    const xData: number[] = [];
    const yData: number[] = [];
    if (!weekEntries || !Array.isArray(weekEntries)) { return { xData, yData }; }

    // Find the category index by name
    const categoryIndex = userCategories.findIndex(cat => cat.name === category);
    const totalTimeEntries = 14; // Weekly total time entries

    weekEntries.forEach((weekEntry) => {
        xData.push(weekEntry.week);
        yData.push(type === "total"
            ? GetTotalTimeEntriesHoursByCategory(categoryIndex, weekEntry)
            : GetAverageTimeEntriesHoursByCategory(categoryIndex, weekEntry, totalTimeEntries));
    });
    return { xData, yData };
};

export const CreateDayOfWeekEntriesBarChartData = (category: string, type: "total" | "average", dayOfWeekEntries: DayOfWeekEntry[], userCategories: CategoryEntry[], selectedDate: number): { xData: string[]; yData: number[] } => {
    const xData: string[] = [];
    const yData: number[] = [];
    if (!dayOfWeekEntries || !Array.isArray(dayOfWeekEntries)) { return { xData, yData }; }

    // Find the category index by name
    const categoryIndex = userCategories.findIndex(cat => cat.name === category);
    const totalTimeEntries = IsSelectedYearLeapYear(selectedDate) ? 366 : 365; // Daily total time entries

    dayOfWeekEntries.forEach((dayOfWeekEntry) => {
        xData.push(DAY_NAMES[dayOfWeekEntry.dayOfWeek as number]);
        yData.push(type === "total" 
            ? GetTotalTimeEntriesHoursByCategory(categoryIndex, dayOfWeekEntry) 
            : GetAverageTimeEntriesHoursByCategory(categoryIndex, dayOfWeekEntry, totalTimeEntries));
    })
    return { xData, yData };
};

export const CreateHourlyEntriesBarChartData = (category: string, type: "total" | "average", hourlyEntries: any[], userCategories: CategoryEntry[]): { xData: string[]; yData: number[] } => {
    const xData: string[] = [];
    const yData: number[] = [];
    if (!hourlyEntries || !Array.isArray(hourlyEntries)) { return { xData, yData }; }
    // Find the category index by name
    const categoryIndex = userCategories.findIndex(cat => cat.name === category);
    hourlyEntries.forEach((hourlyEntry) => {
        xData.push(ConvertHourToHourName(hourlyEntry.hour));
        yData.push(type === "total" ? GetTotalTimeEntriesHoursByCategory(categoryIndex, hourlyEntry) : 0); // Does not use Average
    })
    return { xData, yData };
};

const GetTotalTimeEntriesHoursByCategory = (categoryIndex: number, entry: WeekEntry | DayOfWeekEntry | HourlyEntry): number => {
    if (categoryIndex === -1 || !entry.timeEntries) { return 0; }

    // Handles both nested arrays (WeekEntry) and flat arrays (DayOfWeekEntry, HourlyEntry)
    let count = 0;
    const timeEntries = entry.timeEntries;
    for (let i = 0; i < timeEntries.length; i++) {
        const timeEntry = timeEntries[i];
        if (timeEntry === null) { continue; }
        
        if (Array.isArray(timeEntry)) {
            // Nested array case (WeekEntry)
            for (let j = 0; j < timeEntry.length; j++) {
                const nestedTimeEntry = timeEntry[j];
                if (nestedTimeEntry && (typeof nestedTimeEntry.category === 'number' ? nestedTimeEntry.category : Number(nestedTimeEntry.category)) === categoryIndex) { count++; }
            }
        } else if (timeEntry && (typeof timeEntry.category === 'number' ? timeEntry.category : Number(timeEntry.category)) === categoryIndex) { count++; } // Flat array case (DayOfWeekEntry, HourlyEntry)
    }
    return count / 2;
};

const GetAverageTimeEntriesHoursByCategory = (categoryIndex: number, entry: WeekEntry | DayOfWeekEntry | HourlyEntry, totalTimeEntries: number): number => {
    if (categoryIndex === -1 || !entry.timeEntries) { return 0; }
    
    // Handles both nested arrays (WeekEntry) and flat arrays (DayOfWeekEntry, HourlyEntry)
    let count = 0;
    const timeEntries = entry.timeEntries;
    for (let i = 0; i < timeEntries.length; i++) {
        const timeEntry = timeEntries[i];
        if (timeEntry === null) { continue; }      
        
        if (Array.isArray(timeEntry)) {
            // Nested array case (WeekEntry)
            for (let j = 0; j < timeEntry.length; j++) {
                const nestedTimeEntry = timeEntry[j];
                if (nestedTimeEntry && (typeof nestedTimeEntry.category === 'number' ? nestedTimeEntry.category : Number(nestedTimeEntry.category)) === categoryIndex) { count++; }
            }
        } else if (timeEntry && (typeof timeEntry.category === 'number' ? timeEntry.category : Number(timeEntry.category)) === categoryIndex) { count++; } // Flat array case (DayOfWeekEntry, HourlyEntry)
    }
    if (totalTimeEntries === 0) { return 0; }
    return count / totalTimeEntries;
};

const IsSelectedYearLeapYear = (selectedDate: number): boolean => {
    return dayjs().year(selectedDate).isLeapYear();
};

const ConvertHourToHourName = (hour: string) => {
    const hourNum = parseInt(hour.substring(0, 2), 10);
    const minutes = hour.substring(3); // Extract minutes (skip "HH:")
    const period = hourNum < 12 ? 'AM' : 'PM';
    const displayHour = hourNum === 0 ? 12 : (hourNum > 12 ? hourNum - 12 : hourNum);
    return `${displayHour}:${minutes} ${period}`;
};