export const User = (
    name = "",
    email = "",
    password = "",
    categories = [],
    daily = [],
    weekly = [],
    hourly = []
) => {
    return { 
        name: name, 
        email: email, 
        password: password, 
        categories: categories,
        daily: daily, 
        weekly: weekly,
        hourly: hourly
    }
};
