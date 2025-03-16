export const User = (
    name: string = "",
    email: string = "",
    password: string = "",
    categories: string[] = [],
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
