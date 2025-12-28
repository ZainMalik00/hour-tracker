export const User = (
    name: string = "",
    email: string = "",
    password: string = "",
    categories: Object[] = [],
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
