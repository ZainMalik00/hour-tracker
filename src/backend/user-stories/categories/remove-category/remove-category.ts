import UserService from '../../../services/user-service';
import CategoryService from '../../../services/category-service';

export const RemoveCategory = async (email, category) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        CategoryService.removeCategory(existingUserID[0], category);
    }
}