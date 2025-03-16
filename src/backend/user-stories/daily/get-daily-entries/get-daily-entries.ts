import UserService from '../../../services/user-service.ts';
import DailyEntryService from '../../../services/daily-entry-service.ts';

export const GetCategories = async (email) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        DailyEntryService.getDays(existingUserID[0]);
    }
}