import UserService from '../../../services/user-service';
import DailyEntryService from '../../../services/daily-entry-service';
import { Day } from '../../../entities/Day';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import utc from 'dayjs/plugin/utc';

dayjs.extend(weekOfYear);
dayjs.extend(utc);

export const AddDayEntry = async (email: string, selectedDate: dayjs.Dayjs, timeEntries) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    if(existingUserID.length == 0){ return false; }

    const userID = existingUserID[0];
    
    // Initialize user data if needed (categories, days)
    await UserService.initializeUserData(userID);

    // Extract date components from local date and create UTC date at midnight UTC
    // This ensures "January 15th" always means "January 15th" regardless of user's timezone
    const utcDate = dayjs.utc({ year: selectedDate.year(), month: selectedDate.month(), day: selectedDate.date(), hour: 0, minute: 0, second: 0 });
    const dateString = utcDate.format("YYYY-MM-DD");
    const dayEntry: Day = {
        userID: userID,
        date: dateString,
        week: utcDate.week(),
        dayOfWeek: utcDate.day(),
        timeEntries: timeEntries
    };
    const existingDayEntry = await DailyEntryService.getDayEntry(userID, dateString).then((result: any) => {return result});
    
    if(existingDayEntry){
        let combinedTimeEntries = combineTimeEntries(timeEntries, existingDayEntry.timeEntries, dateString);
        await DailyEntryService.updateDayEntryTimes(existingDayEntry.id, combinedTimeEntries);
        return true
    } 

    await DailyEntryService.addDayEntry(userID, dayEntry);
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
