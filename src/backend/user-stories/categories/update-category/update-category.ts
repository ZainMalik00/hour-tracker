import UserService from '../../../services/user-service.ts';
import CategoryService from '../../../services/category-service.ts';

export const UpdateCategory = async (email, oldCategory, newCategory) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        CategoryService.removeCategory(existingUserID[0], oldCategory);
        CategoryService.addCategory(existingUserID[0], newCategory);
    }
}