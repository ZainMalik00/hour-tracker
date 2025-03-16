import UserService from '../../../services/user-service.ts';
import DailyEntryService from '../../../services/daily-entry-service.ts';

export const AddDayEntry = async (email, dayEntry) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        dayEntry.userID = existingUserID[0]
        DailyEntryService.addDayEntry(existingUserID[0], dayEntry);
    }
}