import UserService from '../../../services/user-service';
import { UserData } from '../../../entities/UserData';
import { DefaultCategories } from '../../../entities/DefaultCategories';

export const AddUserData = async (userID) => {
    const newUserData = UserData(userID, DefaultCategories);

    const existingUserData = await UserService.getUserDataIdByUserID(userID);

    if(existingUserData.length === 0){
        return UserService.addUserData(newUserData); 
    }
    return null;
}
