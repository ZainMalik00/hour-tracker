export const User = (
    name = "",
    email = "",
    password = "",
    categories = [],
    daily = {},
    weekly = [],
    categoriesByHour = []
) => {
    return { 
        name: name, 
        email: email, 
        password: password, 
        categories: categories,
        daily: daily, 
        weekly: weekly,
        categoriesByHour: categoriesByHour
    }
};
