import UserService from '../../../services/user-service';
import DailyEntryService from '../../../services/daily-entry-service';

export const GetDailyEntryTimes = async (email, selectedDate) => {
    const existingUserID = await UserService.getUserIdByEmail(email);

    if(existingUserID.length > 0){
        const DayTimeEntries = await DailyEntryService.getDayEntryTimes(existingUserID[0], selectedDate.format("YYYY-MM-DD")).then((result: any) => {return result});
        return DayTimeEntries;
    }
    return null;
}