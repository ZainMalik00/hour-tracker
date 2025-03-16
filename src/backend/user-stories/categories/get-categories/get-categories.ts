import UserService from '../../../services/user-service.ts';
import CategoryService from '../../../services/category-service.ts';

export const GetCategories = async (email) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        CategoryService.getCategories(existingUserID[0]);
    }
}