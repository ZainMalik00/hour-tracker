import { DayEntry, DayOfWeekEntry } from "../../../entities/Entries";

export const CreateDayOfWeekEntries = (dayEntries: DayEntry[], year: number): DayOfWeekEntry[] => { 
    const yearString = year.toString();
    const combinedMap: { [key: number]: DayOfWeekEntry } = {};

    for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
        combinedMap[dayOfWeek] = {
            dayOfWeek: dayOfWeek,
            timeEntries: null
        };
    }
    
    dayEntries.forEach((dayEntry) => {
        if (dayEntry.date.substring(0, 4) !== yearString) { return; }
        
        const entryDayOfWeek = typeof dayEntry.dayOfWeek === 'string' ? parseInt(dayEntry.dayOfWeek, 10) : dayEntry.dayOfWeek;
        
        // Validate dayOfWeek is in valid range
        if (entryDayOfWeek >= 0 && entryDayOfWeek <= 6 && dayEntry.timeEntries !== null) {
            const existingEntries = combinedMap[entryDayOfWeek].timeEntries;
            if (existingEntries === null) {
                combinedMap[entryDayOfWeek].timeEntries = dayEntry.timeEntries.slice();
            } else {
                combinedMap[entryDayOfWeek].timeEntries = existingEntries.concat(dayEntry.timeEntries);
            }
        }
    });
    
    return Object.values(combinedMap) as DayOfWeekEntry[];
};