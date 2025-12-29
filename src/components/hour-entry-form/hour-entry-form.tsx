import React, { useMemo, useCallback, startTransition } from 'react';
import styles from './hour-entry-form.module.css';
import { Button, Card, FormControl, IconButton, ListItemText, MenuItem, Select, styled, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow } from '@mui/material';
import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import objectSupport from "dayjs/plugin/objectSupport";
import timezone from 'dayjs/plugin/timezone';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ControlPointDuplicateIcon from '@mui/icons-material/ControlPointDuplicate';
import { AddDayEntry } from '../../backend/user-stories/daily/add-daily-entry/add-daily-entry';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(objectSupport);

export interface TimeEntry {
  category: string;
  time: dayjs.Dayjs;
  timezone: string;
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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.vars?.palette?.background?.paper || theme.palette.background.paper,
  },
  '&:hover': {
    backgroundColor: `${theme.vars?.palette?.background?.paper || theme.palette.background.paper} !important`,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

interface HourEntryFormProps {
  selectedDate: dayjs.Dayjs;
  onSelectedDateChange: (date: dayjs.Dayjs) => void;
  timeEntries: TimeEntry[];
  onTimeEntriesChange: (timeEntries: TimeEntry[]) => void;
  userCategories: Array<{
    name: string;
    color?: string;
  }>;
  userData?: {
    user?: {
      email?: string | null;
    };
  } | null;
  onSubmit: () => void;
}

const HourEntryForm = ({
  selectedDate,
  onSelectedDateChange,
  timeEntries,
  onTimeEntriesChange,
  userCategories,
  userData,
  onSubmit
}: HourEntryFormProps) => {
  const numTimeSlots = timeEntries.length;

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
    onTimeEntriesChange([...timeEntries, {
      category: getCategoryValue(userCategories[0]),
      time: dayjs({ hour, minute }),
      timezone: DEFAULT_TIMEZONE
    }]);
  }, [userCategories, getCategoryValue, usedTimes, timeEntries, onTimeEntriesChange]);

  const addRemainingTimeEntries = useCallback(() => {
    const remainingCount = MAX_TIME_SLOTS - numTimeSlots;
    if (remainingCount <= 0) return;
    
    const categoryValue = getCategoryValue(userCategories[0]);
    
    // Use startTransition to make this update non-blocking
    startTransition(() => {
      const currentUsedTimes = new Set<string>();
      for (const entry of timeEntries) {
        currentUsedTimes.add(entry.time.format('HH:mm'));
      }
      
      const availableSlots: string[] = [];
      for (const slot of ALL_TIME_SLOTS) {
        if (!currentUsedTimes.has(slot)) {
          availableSlots.push(slot);
          if (availableSlots.length >= remainingCount) break;
        }
      }

      const newEntries: TimeEntry[] = new Array(remainingCount);
      
      for (let i = 0; i < remainingCount; i++) {
        const [hour, minute] = availableSlots[i].split(':').map(Number);
        newEntries[i] = {
          category: categoryValue,
          time: dayjs({ hour, minute }),
          timezone: DEFAULT_TIMEZONE
        };
      }
      
      onTimeEntriesChange([...timeEntries, ...newEntries]);
    });
  }, [numTimeSlots, userCategories, getCategoryValue, timeEntries, onTimeEntriesChange]);

  const removeTimeEntry = useCallback((index: number) => {
    const newTimeEntries = [...timeEntries];
    newTimeEntries.splice(index, 1);
    onTimeEntriesChange(newTimeEntries);
  }, [timeEntries, onTimeEntriesChange]);

  const removeAllTimeEntries = useCallback(() => {
    onTimeEntriesChange([]);
  }, [onTimeEntriesChange]);

  const updateTimeEntries = useCallback((event) => {
    const {name, value} = event.target;
    const newTimeEntries = [...timeEntries];
    newTimeEntries[value.index] = {...newTimeEntries[value.index], [name]: value.value};
    onTimeEntriesChange(newTimeEntries);
  }, [timeEntries, onTimeEntriesChange]);

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
        onSubmit();
      }
    }
  }, [timeEntries, userData?.user?.email, selectedDate, onSubmit]);

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

  const skeletonRowCount = Math.max(0, Math.min(4, 4 - timeEntries.length));

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
              onChange={(value) => {if(value){ onSelectedDateChange(value) }}} 
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

        <Card sx={{backgroundColor: "primary.contrastText"}}>
          <TableContainer>
            <Table stickyHeader aria-label="Time Entries Table">
              <TableHead>
                <TableRow>
                  
                  <StyledTableCell key={"time"} sx={{ maxWidth: '168px', width: '168px' }}>Time</StyledTableCell>
                  <StyledTableCell key={"timezone"} sx={{ maxWidth: '230px', width: '230px' }}>Timezone</StyledTableCell>
                  <StyledTableCell key={"category"} sx={{ maxWidth: '196px', width: '196px' }}>Category</StyledTableCell>
                  <StyledTableCell key={"remove"} sx={{ maxWidth: '72px', width: '72px' }}>Action</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timeEntries?.map(function (formEntry, index) {
                    return (
                      <StyledTableRow hover role="checkbox" tabIndex={-1} key={index}>
                        <StyledTableCell key={"time"} sx={{ maxWidth: '168px', width: '168px' }}>
                          <FormControl size="small" required>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <TimePicker 
                                timezone={formEntry.timezone}
                                shouldDisableTime={createShouldDisableTime(index)}
                                value={formEntry.time}
                                onChange={(value)=> {updateTimeEntries(createTimeEntryOnChangeEvent("time", value, index))}}  
                                timeSteps={{ minutes: 30 }}
                                sx={{ 
                                  maxWidth: "132px",
                                  minWidth: '132px',
                                  maxHeight: '40px',
                                  '& .MuiInputBase-root': {
                                    maxHeight: '40px',
                                  },
                                  '& .MuiInputBase-input': {
                                    maxHeight: '40px',
                                  }
                                }} 
                              />
                            </LocalizationProvider>
                          </FormControl>
                        </StyledTableCell>
                        <StyledTableCell key={"timezone"} sx={{ maxWidth: '230px', width: '230px' }}>
                          <FormControl size="small" sx={{ width: '100%', maxWidth: '230px' }}>
                            <Select
                              name="Timezone"
                              key={index}
                              value={formEntry.timezone}
                              renderValue={(value) => (
                                <span style={{ 
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'block',
                                  maxWidth: '200px'
                                }}>
                                  {value}
                                </span>
                              )}
                              sx={{ 
                                width: '100%',
                                maxWidth: '230px',
                                '& .MuiSelect-select': {
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }
                              }}
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
                        </StyledTableCell>
                        <TableCell key={"category"}>
                          <FormControl size="small" sx={{ width: '100%', maxWidth: '196px' }} required>
                            <Select
                              name="category"
                              key={index}
                              value={formEntry.category}
                              onChange={(event)=> {updateTimeEntries(createTimeEntryOnChangeEvent("category", event.target.value, index))}}
                              renderValue={(value) => (
                                <span style={{ 
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'block',
                                  maxWidth: '166px'
                                }}>
                                  {value}
                                </span>
                              )}
                              sx={{ 
                                width: '100%',
                                maxWidth: '196px',
                                '& .MuiSelect-select': {
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }
                              }}
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
                        </TableCell>
                        <StyledTableCell key={"remove"}>
                          <IconButton aria-label="remove time entry" onClick={() => removeTimeEntry(index)}>
                            <RemoveCircleOutlineIcon color='primary' />
                          </IconButton>
                        </StyledTableCell>
                      </StyledTableRow>
                    );
                  })}
                {Array.from({ length: skeletonRowCount }).map((_, skeletonIndex) => (
                  <StyledTableRow key={`skeleton-${skeletonIndex}`}>
                    <StyledTableCell sx={{ maxWidth: '168px', width: '168px', height: '73px' }}></StyledTableCell>
                    <StyledTableCell sx={{ maxWidth: '230px', width: '230px', height: '73px' }}></StyledTableCell>
                    <TableCell></TableCell>
                    <StyledTableCell>

                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
        </form>
      </div>
    </div>
  )
};

export default HourEntryForm;
