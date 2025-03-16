import UserService from '../../../services/user-service.ts';
import DailyEntryService from '../../../services/daily-entry-service.ts';

export const RemoveDayEntry = async (email, dayEntry) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        DailyEntryService.removeDayEntry(existingUserID[0], dayEntry);
    }
}