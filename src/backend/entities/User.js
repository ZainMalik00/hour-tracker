export const User = (
    name = "",
    email = "",
    password = "",
    categories = [],
    days = {},
) => {
    return { 
        name: name, 
        email: email, 
        password: password, 
        categories: categories,
        days: days, 
    }
};
