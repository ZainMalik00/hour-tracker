import UserService from '../../../services/user-service.js';
import AnnualCategoryEntryService from '../../../services/annual-categeory-entry-service.js';

export const UpdateDayEntry = async (email, oldAnnualCategoryEntry, newAnnualCategoryEntry) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        AnnualCategoryEntryService.removeAnnualCategoryEntry(existingUserID[0], oldAnnualCategoryEntry);
        AnnualCategoryEntryService.addAnnualCategoryEntry(existingUserID[0], newAnnualCategoryEntry);
    }
}