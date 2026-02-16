import { DayEntry, HourlyEntry, TimeEntry } from "../../../entities/Entries";

export const CreateHourlyEntries = (dayEntries: DayEntry[], year: number): HourlyEntry[] => {
    const yearString = year.toString();
    const combinedMap: { [key: number]: any } = {};
    const timeIntervalToIndexMap = new Map<string, number>();
    
    for (let hour = 0; hour <= 47; hour+=2) {
        const hourValue = hour / 2;
        const hourStr = hourValue < 10 ? "0" + hourValue + ":00" : hourValue + ":00";
        const halfHourStr = hourValue < 10 ? "0" + hourValue + ":30" : hourValue + ":30";
        
        combinedMap[hour] = {
            hour: hourStr,
            timeEntries: []
        };
        combinedMap[hour + 1] = {
            hour: halfHourStr,
            timeEntries: []
        };
        timeIntervalToIndexMap.set(hourStr, hour);
        timeIntervalToIndexMap.set(halfHourStr, hour + 1);
    }

    if (!dayEntries || dayEntries.length === 0) { return Object.values(combinedMap); }

    const filteredEntries = dayEntries.filter(dayEntry => dayEntry.date.substring(0, 4) === yearString);

    filteredEntries.forEach((dayEntry) => {
        if (!dayEntry.timeEntries) { return; }
        
        dayEntry.timeEntries.forEach((timeEntry: TimeEntry) => {
            // Handle both string format ("T14:30:00Z") and dayjs object
            let timeString: string;
            const timeValue = timeEntry.time as any;
            if (typeof timeValue === 'string') {
                // If it's a string, extract HH:mm from format "THH:mm:ssZ"
                timeString = timeValue.substring(1, 6);
            } else if (timeValue && typeof timeValue.format === 'function') {
                // If it's a dayjs object, format it as HH:mm
                timeString = timeValue.format('HH:mm');
            } else { return; }
            
            const index = timeIntervalToIndexMap.get(timeString);
            if (index !== undefined) {
                combinedMap[index].timeEntries.push(timeEntry);  
            }
        });
    });
    return Object.values(combinedMap);
};