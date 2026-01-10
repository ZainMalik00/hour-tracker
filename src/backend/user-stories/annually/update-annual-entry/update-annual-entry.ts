import UserService from '../../../services/user-service';
import AnnualCategoryEntryService from '../../../services/annual-categeory-entry-service';

export const UpdateAnnualCategoryEntry = async (email, oldAnnualCategoryEntry, newAnnualCategoryEntry) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        AnnualCategoryEntryService.removeAnnualCategoryEntry(existingUserID[0], oldAnnualCategoryEntry);
        AnnualCategoryEntryService.addAnnualCategoryEntry(existingUserID[0], newAnnualCategoryEntry);
    }
}