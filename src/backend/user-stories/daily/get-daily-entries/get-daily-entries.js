import UserService from '../../../services/user-service.js';
import DailyEntryService from '../../../services/daily-entry-service.js';

export const GetCategories = async (email) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        DailyEntryService.getDays(existingUserID[0]);
    }
}