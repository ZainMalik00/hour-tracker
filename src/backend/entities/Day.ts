export const Day = (
    userID: string = "",
    date: string = "",
    week: Number = 0,
    dayOfWeek: string = "",
    categoriesPerHalfHour = {}
) => {
    return {
        userID: userID, 
        date: date, 
        week: week, 
        dayOfWeek: dayOfWeek,
        categoriesPerHalfHour: categoriesPerHalfHour
    }
};
