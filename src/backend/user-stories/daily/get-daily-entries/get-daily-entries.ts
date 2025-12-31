import UserService from '../../../services/user-service';
import DailyEntryService from '../../../services/daily-entry-service';

export const GetDays = async (email) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        const dayEntriesList = await DailyEntryService.getDays(existingUserID[0]).then((result: any) => {return result});
        return dayEntriesList;
    }
}