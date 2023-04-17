import UserService from '../../../services/user-service.js';
import AnnualCategoryEntryService from '../../../services/annual-categeory-entry-service.js';

export const RemoveAnnualCategoryEntry = async (email, annualCategoryEntry) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        AnnualCategoryEntryService.removeAnnualCategoryEntry(existingUserID[0], annualCategoryEntry);
    }
}