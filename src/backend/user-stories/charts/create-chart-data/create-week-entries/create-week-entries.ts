import { DayEntry } from "../../../../../backend/entities/Entries";

export const CreateWeekEntries = (dayEntries: DayEntry[], year: number): any[] => {
    // Initialize combinedMap with minimum 52 weeks (always include weeks 1-52)
    const combinedMap: { [key: number]: any } = {};
    for (let week = 1; week <= 52; week++) {
        combinedMap[week] = {
            week: week,
            timeEntries: null
        };
    }
    
    if (!dayEntries || dayEntries.length === 0) { return Object.values(combinedMap); }

    const yearString = year.toString();
    const filteredEntries = dayEntries.filter(dayEntry => dayEntry.date.substring(0, 4) === yearString); // substring is the year

    filteredEntries.forEach((dayEntry) => {
        const commonWeek = getCorrectWeek(dayEntry);
        dayEntry.week = commonWeek;

        if (commonWeek >= 1 && commonWeek <= 54) {
            // Add week 53 or 54 to map if not already present
            if (commonWeek === 53 && !combinedMap[53]) {
                combinedMap[53] = { week: 53, timeEntries: null };
            }
            if (commonWeek === 54 && !combinedMap[54]) {
                combinedMap[54] = { week: 54, timeEntries: null };
            }
            
            if (!combinedMap[commonWeek].timeEntries) {
                const { date, dayOfWeek, ...dayEntryReduced } = dayEntry;
                combinedMap[commonWeek].timeEntries = [dayEntryReduced.timeEntries];
            } else {
                combinedMap[commonWeek].timeEntries.push(dayEntry.timeEntries);
            }
        }
    });

    return Object.values(combinedMap);
};

const getCorrectWeek = (dayEntry: DayEntry) => {
        const month = dayEntry.date.substring(5, 7);
        if(month === "12" && dayEntry.week === 1 ){ return 53; }
        if(month === "12" && dayEntry.week === 2 ){ return 54; }
        return dayEntry.week;
};
    