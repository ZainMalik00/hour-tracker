import UserService from '../../../services/user-service';
import CategoryService from '../../../services/category-service';

export const ResetCategories = async (email) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){ CategoryService.resetCategories(existingUserID[0]); }
}