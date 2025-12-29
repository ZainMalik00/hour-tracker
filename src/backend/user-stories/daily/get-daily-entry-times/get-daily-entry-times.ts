import UserService from '../../../services/user-service';
import DailyEntryService from '../../../services/daily-entry-service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const GetDailyEntryTimes = async (email, selectedDate: dayjs.Dayjs) => {
    if (!email) { return null; }
    const existingUserID = await UserService.getUserIdByEmail(email);

    if(existingUserID.length > 0){
        const utcDate = dayjs.utc({ year: selectedDate.year(), month: selectedDate.month(), day: selectedDate.date(), hour: 0, minute: 0, second: 0 });
        const DayTimeEntries = await DailyEntryService.getDayEntryTimes(existingUserID[0], utcDate.format("YYYY-MM-DD")).then((result: any) => {return result});
        return DayTimeEntries;
    }
    return null;
}