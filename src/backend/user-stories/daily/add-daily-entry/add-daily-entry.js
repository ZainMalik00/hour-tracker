import UserService from '../../../services/user-service.js';
import DailyEntryService from '../../../services/daily-entry-service.js';

export const AddDayEntry = async (email, dayEntry) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        DailyEntryService.addDayEntry(existingUserID[0], dayEntry);
    }
}