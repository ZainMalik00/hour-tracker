import UserService from '../../../services/user-service';
import DailyEntryService from '../../../services/daily-entry-service';

export const UpdateDayEntry = async (email, oldDayEntry, newDayEntry) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        DailyEntryService.removeDayEntry(existingUserID[0], oldDayEntry);
        DailyEntryService.addDayEntry(existingUserID[0], newDayEntry);
    }
}