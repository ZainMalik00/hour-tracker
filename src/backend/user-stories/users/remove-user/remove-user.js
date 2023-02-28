import UserService from '../../../services/user-service.js';

export const RemoveUser = async (email) => {
    const existingUser = await UserService.getUserIdByEmail(email);

    if(existingUser.length > 0){
        UserService.removeUser(existingUser[0]);
    }
}