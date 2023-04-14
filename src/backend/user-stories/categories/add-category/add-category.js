import UserService from '../../../services/user-service.js';
import CategoryService from '../../../services/category-service.js';

export const AddCategory = async (email, category) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        CategoryService.addCategory(existingUserID[0], category);
    }
}