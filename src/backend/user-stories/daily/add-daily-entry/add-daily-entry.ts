import UserService from '../../../services/user-service';
import DailyEntryService from '../../../services/daily-entry-service';
import { AddUserData } from '../../users/add-user-data/add-user-data';
import { Day } from '../../../entities/Day';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);

export const AddDayEntry = async (email: string, date: dayjs.Dayjs, timeEntries) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        const dayEntry = Day(
            existingUserID[0],
            date.format("YYYY-MM-DD"),
            date.week(),
            date.day(),
            timeEntries
        );
        
        const existingUserData = await UserService.getUserDataIdByUserID(existingUserID[0]);
        if(existingUserData.length > 0){
            await DailyEntryService.addDayEntry(existingUserData[0], dayEntry);
            return true
        } else {
            const newUserDataID = await AddUserData(existingUserID[0]);
            if(newUserDataID){
                await DailyEntryService.addDayEntry(existingUserData[0], dayEntry);
                return true
            }
        }
    }
    return false;
}