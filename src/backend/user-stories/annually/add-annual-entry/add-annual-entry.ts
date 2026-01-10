import UserService from '../../../services/user-service';
import AnnualCategoryEntryService from '../../../services/annual-categeory-entry-service';

export const AddAnnualCategoryEntry = async (email, annualCategoryEntry) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        AnnualCategoryEntryService.addAnnualCategoryEntry(existingUserID[0], annualCategoryEntry);
    }
}