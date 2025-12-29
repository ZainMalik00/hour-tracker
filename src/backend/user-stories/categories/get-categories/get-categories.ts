import UserService from '../../../services/user-service';
import CategoryService from '../../../services/category-service';
import { CategoryEntry } from '../../../entities/DefaultCategories';

export const GetCategories = async (email: string): Promise<CategoryEntry[] | null>  => {
    if (!email) { return null; }
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        const userID = existingUserID[0];
        
        // Initialize user data if needed (categories, days)
        await UserService.initializeUserData(userID);
        
        const userCategories = await CategoryService.getCategories(userID).then((result: any) => {return result});
        return userCategories;
    }
    return null;
}