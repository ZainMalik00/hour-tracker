export const User = (
    name = "",
    email = "",
    password = "",
    hourly = [],
    weekly = [],
    categorically = []
) => {
    return { 
        name: name, 
        email: email, 
        password: password, 
        hourly: hourly, 
        weekly: weekly,
        categorically: categorically
    }
};
