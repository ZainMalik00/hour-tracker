export const UserData = (
    userID: string = "",
    categories: string[] = [],
    days = {},
) => {
    return { 
        userID: userID, 
        categories: categories,
        days: days, 
    }
};
