import UserService from '../../../services/user-service';
import CategoryService from '../../../services/category-service';
import { AddUserData } from '../../users/add-user-data/add-user-data';

export const GetCategories = async (email: string): Promise<string[] | null>  => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        const existingUserData = await UserService.getUserDataIdByUserID(existingUserID[0]);
        if(existingUserData.length > 0){
            const userCategories = await CategoryService.getCategories(existingUserData[0]).then((result: any) => {return result});
            return userCategories
        } else {
            const newUserDataID = await AddUserData(existingUserID[0]);
            if(newUserDataID){
                const userCategories = await CategoryService.getCategories(newUserDataID).then((result: any) => {return result});
                return userCategories
            }
        }
    }
    return null;
}