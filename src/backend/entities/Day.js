export const Day = (
    userID = "",
    date = "",
    week = 0,
    dayOfWeek = "",
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
