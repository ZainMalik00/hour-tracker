import UserService from '../../../services/user-service.js';
import CategoryService from '../../../services/category-service.js';

export const GetCategories = async (email) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    console.log(existingUserID)
    if(existingUserID.length > 0){
        CategoryService.getCategories(existingUserID[0]);
    }
}