import React, { useEffect, useState, useMemo, useCallback } from 'react';
import styles from './hour-entry-form.module.css';
import { Button, FormControl, FormControlLabel, FormLabel, IconButton, Input, InputLabel, ListItemText, MenuItem, Select } from '@mui/material';
import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { GetCategories } from '../../backend/user-stories/categories/get-categories/get-categories';
import { useSession } from 'next-auth/react';
import { DefaultCategories } from '../../backend/entities/DefaultCategories';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import  objectSupport from "dayjs/plugin/objectSupport";
import timezone from 'dayjs/plugin/timezone';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { AddDayEntry } from '../../backend/user-stories/daily/add-daily-entry/add-daily-entry';
import DayTimeline from '../day-timeline/day-timeline';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(objectSupport);
interface TimeEntry {
  category: string,
  time: dayjs.Dayjs,
  timezone: string
} 

const TIMEZONES = Intl.supportedValuesOf("timeZone");
const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

const HourEntryForm = () => {
  const { data: userData } = useSession();
  const [userCategories, setUserCategories] = useState(DefaultCategories);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    const getUserCategories = async() => {
      if(userData?.user?.email){
        GetCategories(userData?.user?.email).then((categoryList) => {
          setUserCategories(categoryList!); 
        });
      }
    }
    getUserCategories();
  }, [userData?.user?.email]);

  const getCategoryValue = useCallback((category: any): string => {
    return typeof category === 'string' ? category : category.name;
  }, []);

  const addTimeEntry = useCallback(() => {
    const newTimeEntry: TimeEntry = {
      category: getCategoryValue(userCategories[0]),
      time: dayjs({ hour:0, minute:0 }),
      timezone: DEFAULT_TIMEZONE
    }
    setTimeEntries(prev => [...prev, newTimeEntry]);
  }, [userCategories, getCategoryValue]);

  const removeTimeEntry = useCallback((index: number) => {
    setTimeEntries(prev => {
      const newTimeEntries = [...prev];
      newTimeEntries.splice(index, 1);
      return newTimeEntries;
    });
  }, []);

  const updateTimeEntries = useCallback((event) => {
    const {name, value} = event.target;
    setTimeEntries(prev => {
      const newTimeEntries = [...prev];
      newTimeEntries[value.index] = {...newTimeEntries[value.index], [name]: value.value};
      return newTimeEntries;
    });
  }, []);

  const createTimeEntryOnChangeEvent = useCallback((name:string, value: any, index: number) => {
    return {target: {name: name, value:{index: index, value:value}}}
  }, []);

  const submitForm = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    const formattedTimeEntries = timeEntries.map((timeEntry) => ({
      category: timeEntry.category,
      time: timeEntry.time.format('THH:mm:ssZ')
    }));

    if(userData?.user?.email){
      AddDayEntry(userData?.user?.email, selectedDate, formattedTimeEntries)
    }
  }, [timeEntries, userData?.user?.email, selectedDate]);

  const createShouldDisableTime = useCallback((pickerIndex: number) => {
    return (value: dayjs.Dayjs | null, view: string) => {
      // Skip if not checking time view or value is null
      if (!value || (view !== 'hours' && view !== 'minutes')) return false;
      
      // Check if this time is already used by another entry
      const timeKey = value.format('HH:mm');
      return timeEntries.some((timeEntry, index) => 
        pickerIndex !== index && timeEntry.time.format('HH:mm') === timeKey
      );
    };
  }, [timeEntries]);

  // const calculateTimezoneOffset = (timezone: string) => {
  //   let offset= new Intl.DateTimeFormat('en',{timeZone:timezone, timeZoneName:'shortOffset'})
  //     .formatToParts().find(part => part.type==='timeZoneName')!.value.slice(3)
  //   if(!offset){
  //     offset="0"
  //   }
    
  //   return Number(offset)
  // }

  // const changeTimezone = (event) => {
  //   const newTimeZone = event.target.value.toString()
    
  //   setTimeEntries({
  //     ...timeEntries,
  //     timeEntries["categoryTime"]: dayjs.tz(timeEntries["categoryTime"], newTimeZone)
  //     // ["categoryTime"]: timeEntries["categoryTime"].add(calculateTimezoneOffset(newTimeZone), 'hour')
  //   });
  //   setSelectedTimezone(newTimeZone)
  // }

  return(
    <div className={styles.HourEntryForm}>
      <form onSubmit={submitForm}>
      <FormControl size="small" required>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker 
            label="Date *"
            value={selectedDate}
            onChange={(value) => {setSelectedDate(dayjs.utc(value))}} 
          />
        </LocalizationProvider>
      </FormControl>
      <Button 
        size='large'
        variant="outlined" 
        startIcon={<AddCircleOutlineIcon />} 
        onClick={addTimeEntry}
      >
        Add Time Entry
      </Button>
      {timeEntries?.map(function (formEntry, index) {
        return (
          <div key={index}>
            <FormControl size="small" required>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker 
                  label="Time *"
                  timezone={formEntry.timezone}
                  shouldDisableTime={createShouldDisableTime(index)}
                  value={formEntry.time}
                  onChange={(value)=> {updateTimeEntries(createTimeEntryOnChangeEvent("time", value, index))}}  
                  timeSteps={{ minutes: 30 }} 
                />
              </LocalizationProvider>
            </FormControl>
            <FormControl size="small">
              <InputLabel id="">Timezone</InputLabel>
              <Select
                name="Timezone"
                label="Timezone"
                key={index}
                value={formEntry.timezone}
                onChange={(event) => {updateTimeEntries(createTimeEntryOnChangeEvent("timezone", event.target.value.toString(), index))}}
              >
                {TIMEZONES.map(function (element, tzIndex) {
                    return (
                      <MenuItem key={tzIndex} value={element}>
                        <ListItemText primary={element} />
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>
            <FormControl size="small" required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                label="Category"
                key={index}
                value={formEntry.category}
                onChange={(event)=> {updateTimeEntries(createTimeEntryOnChangeEvent("category", event.target.value, index))}}
              >
                {userCategories.map(function (element, catIndex) {
                    return (
                      <MenuItem key={catIndex} value={element.name}>
                        <ListItemText primary={element.name} />
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>
            <IconButton aria-label="remove time entry" onClick={() => removeTimeEntry(index)}>
              <RemoveCircleOutlineIcon color='primary' />
            </IconButton>
          </div>
        );
      })}
      
      <Button variant="contained" size='large' type='submit' disabled={timeEntries.length == 0}>Submit</Button>
      </form>
      <DayTimeline selectedDate={selectedDate} userData={userData || undefined} userCategories={userCategories}/>
    </div>
  )
};

export default HourEntryForm;
