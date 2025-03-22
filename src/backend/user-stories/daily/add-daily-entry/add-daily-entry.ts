import UserService from '../../../services/user-service';
import DailyEntryService from '../../../services/daily-entry-service';
import { AddUserData } from '../../users/add-user-data/add-user-data';
import { Day } from '../../../entities/Day';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);

export const AddDayEntry = async (email: string, date: dayjs.Dayjs, timeEntries) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    if(existingUserID.length == 0){ return false; }

    const existingUserData = await UserService.getUserDataIdByUserID(existingUserID[0]);
    if(existingUserData.length == 0){
        const newUserDataID = await AddUserData(existingUserID[0]);
        if(!newUserDataID){ return false; }
    }

    const dayEntry = Day(
        existingUserID[0],
        date.format("YYYY-MM-DD"),
        date.week(),
        date.day(),
        timeEntries
    );
    const existingDayEntry = await DailyEntryService.getDayEntry(existingUserID[0], date.format("YYYY-MM-DD")).then((result: any) => {return result});
    
    if(existingDayEntry){
        let combinedTimeEntries = combineTimeEntries(timeEntries, existingDayEntry.timeEntries, date.format("YYYY-MM-DD"));
        await DailyEntryService.updateDayEntryTimes(existingDayEntry.id, combinedTimeEntries);
        return true
    } 

    await DailyEntryService.addDayEntry(existingUserData[0], dayEntry);
    return true
}

const checkDayEntryExists = async (userID: string, date: string) => {
    const dayEntry = await DailyEntryService.getDayEntry(userID, date);
    if(dayEntry){ return true; }
    return false;
}

const combineTimeEntries = (newTimeEntries: string[], oldTimeEntries: string[], date: string) => {
    let combinedTimeEntries: string[] = [...newTimeEntries]
    oldTimeEntries.forEach((oldEntry) => {
        let timeEntryExists = false
        newTimeEntries.forEach((newEntry) => {
            if(timeEntriesTimesEqual(oldEntry, newEntry, date)){ 
                timeEntryExists = true
            }
        }); 
        if(!timeEntryExists){ combinedTimeEntries.push(oldEntry); }
    })
    return combinedTimeEntries;
}
 
const timeEntriesTimesEqual = (timeEntry1: string, timeEntry2: string, date: string) => {
    if(timeEntry1 == timeEntry2 || dayjs.utc(date+timeEntry1["time"]).isSame(dayjs.utc(date+timeEntry2["time"]))){
        return true;
    }
    return false;
}

const timeEntriesCategoryEqual = (timeEntry1: string, timeEntry2: string) => {
    if(timeEntry1["category"] == timeEntry2["category"]){
        return true;
    }
    return false;
}
