import UserService from '../../../services/user-service';
import CategoryService from '../../../services/category-service';
import { CategoryEntry } from '../../../entities/DefaultCategories';

export const UpdateCategories = async (email: string, categories: CategoryEntry[]): Promise<void>  => {
    if (!email) { return; }
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        const userID = existingUserID[0];
        await CategoryService.updateCategories(userID, categories);
    }
}