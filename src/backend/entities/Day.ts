export const Day = (
    userID: string,
    date: string,
    week: Number,
    dayOfWeek: Number,
    timeEntries = []
) => {
    return {
        userID: userID, 
        date: date, 
        week: week, 
        dayOfWeek: dayOfWeek,
        timeEntries: timeEntries
    }
};
