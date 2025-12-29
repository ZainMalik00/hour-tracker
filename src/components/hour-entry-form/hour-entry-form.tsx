import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
import ControlPointDuplicateIcon from '@mui/icons-material/ControlPointDuplicate';
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
const MAX_TIME_SLOTS = 48;
const ALL_TIME_SLOTS : Set<string> = (() => {
  let timeSlots: Set<string> = new Set<string>();
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour < 10 ? `0${hour}` : `${hour}`;
      const m = minute < 10 ? `0${minute}` : `${minute}`;
      timeSlots.add(`${h}:${m}`);
    }
  }
  return timeSlots;
})();

interface HourEntryFormProps {
  onTimeEntriesChange?: (length: number) => void;
}

const HourEntryForm = ({ onTimeEntriesChange }: HourEntryFormProps) => {
  const { data: userData } = useSession();
  const [userCategories, setUserCategories] = useState(DefaultCategories);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [numTimeSlots, setNumTimeSlots] = useState(0);
  const prevLengthRef = useRef<number>(0);
  const callbackRef = useRef(onTimeEntriesChange);
  const prevEmailRef = useRef<string | undefined>(userData?.user?.email);

  useEffect(() => {
    // Update callback ref and notify parent when length changes
    callbackRef.current = onTimeEntriesChange;
    const currentLength = timeEntries.length;
    if (currentLength !== prevLengthRef.current && callbackRef.current) {
      callbackRef.current(currentLength);
      prevLengthRef.current = currentLength;
    }

    // Get user categories when email changes
    const currentEmail = userData?.user?.email;
    if (currentEmail !== prevEmailRef.current) {
      prevEmailRef.current = currentEmail;
      if (currentEmail) {
        GetCategories(currentEmail).then((categoryList) => {
          setUserCategories(categoryList!); 
        });
      }
    }
  }, [timeEntries, onTimeEntriesChange, userData?.user?.email]);

  const getCategoryValue = useCallback((category: any): string => {
    return typeof category === 'string' ? category : category.name;
  }, []);

  const usedTimes = useMemo(() => {
    return new Set(timeEntries.map(entry => entry.time.format('HH:mm')));
  }, [timeEntries]);

  const addTimeEntry = useCallback(() => {
    const availableSlots = Array.from(ALL_TIME_SLOTS).filter(slot => !usedTimes.has(slot));
    const nextTimeSlot = availableSlots[0] || '00:00';
    const [hour, minute] = nextTimeSlot.split(':').map(Number);
    setTimeEntries(prev => [...prev, {
      category: getCategoryValue(userCategories[0]),
      time: dayjs({ hour, minute }),
      timezone: DEFAULT_TIMEZONE
    }]);
    setNumTimeSlots(prev => prev + 1)
  }, [userCategories, getCategoryValue, usedTimes]);

  const addRemainingTimeEntries = useCallback(() => {
    const remainingCount = MAX_TIME_SLOTS - numTimeSlots;
    if (remainingCount <= 0) return;
    
    setTimeEntries(prev => {
      const currentUsedTimes = new Set(prev.map(entry => entry.time.format('HH:mm')));
      const availableSlots = Array.from(ALL_TIME_SLOTS).filter(slot => !currentUsedTimes.has(slot));
      const newEntries: TimeEntry[] = [];
      
      for (let i = 0; i < remainingCount; i++) {
        const [hour, minute] = availableSlots[i].split(':').map(Number);
        newEntries.push({
          category: getCategoryValue(userCategories[0]),
          time: dayjs({ hour, minute }),
          timezone: DEFAULT_TIMEZONE
        });
      }      
      return [...prev, ...newEntries];
    });
    setNumTimeSlots(MAX_TIME_SLOTS);
  }, [numTimeSlots, userCategories, getCategoryValue]);

  const removeTimeEntry = useCallback((index: number) => {
    setTimeEntries(prev => {
      const newTimeEntries = [...prev];
      newTimeEntries.splice(index, 1);
      return newTimeEntries;
    });
    setNumTimeSlots(prev => prev - 1)
  }, []);

  const removeAllTimeEntries = useCallback(() => {
    setTimeEntries([]);
    setNumTimeSlots(0);
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

  const submitForm = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    const formattedTimeEntries = timeEntries.map((timeEntry) => ({
      category: timeEntry.category,
      time: timeEntry.time.format('THH:mm:ssZ')
    }));

    if(userData?.user?.email){
      const success = await AddDayEntry(userData?.user?.email, selectedDate, formattedTimeEntries);
      if(success){
        setTimeEntries([]);
        setRefreshTrigger(prev => prev + 1);
      }
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
      <div className={styles.FormContents}>
        <form onSubmit={submitForm} id="hour-entry-form">
        <FormControl size="small" required>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker 
              label="Date *"
              value={selectedDate}
              onChange={(value) => {if(value){ setSelectedDate(value) }}} 
            />
          </LocalizationProvider>
        </FormControl>
        <Button 
          size='large'
          variant="outlined" 
          startIcon={<AddCircleOutlineIcon />} 
          onClick={addTimeEntry}
          disabled={numTimeSlots >= MAX_TIME_SLOTS}
        >
          Add Time Entry
        </Button>
        <Button 
          size='large'
          variant="outlined" 
          startIcon={<ControlPointDuplicateIcon />} 
          onClick={addRemainingTimeEntries}
          disabled={numTimeSlots >= MAX_TIME_SLOTS}
        >
          {numTimeSlots == 0 ? "Add All" : "Add Remaining"}
        </Button>
        <Button 
          size='large'
          variant="outlined" 
          startIcon={<RemoveCircleOutlineIcon />} 
          onClick={removeAllTimeEntries}
          disabled={numTimeSlots <= 0}
        >
          Remove All
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
        
        </form>
        <DayTimeline selectedDate={selectedDate} userData={userData || undefined} userCategories={userCategories} selectedTimeEntries={timeEntries} refreshTrigger={refreshTrigger}/>
      </div>
    </div>
  )
};

export default HourEntryForm;
