import UserService from '../../../services/user-service.ts';

export const RemoveUser = async (email) => {
    const existingUser = await UserService.getUserIdByEmail(email);

    if(existingUser.length > 0){
        UserService.removeUser(existingUser[0]);
    }
}