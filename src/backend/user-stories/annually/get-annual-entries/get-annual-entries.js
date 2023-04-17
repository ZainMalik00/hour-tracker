import UserService from '../../../services/user-service.js';
import AnnualCategoryEntryService from '../../../services/annual-categeory-entry-service.js';

export const GetAnnualCategories = async (email) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        AnnualCategoryEntryService.getAnnualCategoryEntries(existingUserID[0]);
    }
}