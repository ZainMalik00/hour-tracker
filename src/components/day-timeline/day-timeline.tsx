import React, { useEffect, useState, useMemo, useCallback } from 'react';
import styles from './day-timeline.module.css';
import { useTheme, useMediaQuery } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent, { timelineContentClasses } from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent, { timelineOppositeContentClasses } from '@mui/lab/TimelineOppositeContent';
import dayjs from 'dayjs';
import objectSupport from 'dayjs/plugin/objectSupport';
import { GetDailyEntryTimes } from '../../backend/user-stories/daily/get-daily-entry-times/get-daily-entry-times';

dayjs.extend(objectSupport);

interface TimeEntry {
  category: string,
  time: string,
  type?: string
} 

interface SelectedTimeEntry {
  category: string,
  time: dayjs.Dayjs,
  timezone: string
} 

const createDefaultDayTimeEntries = () => {
    let defaultDTE: TimeEntry[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      let date = dayjs({hour: hour, minute: 0, second: 0});
      defaultDTE.push({category : "", "time" : date.format("THH:mm:ssZ")});
      date = dayjs({hour: hour, minute: 30, second: 0});
      defaultDTE.push({category : "", "time" : date.format("THH:mm:ssZ")});
    }
    return defaultDTE;
}

const DEFAULT_DAY_TIME_ENTRIES = createDefaultDayTimeEntries();

interface DayTimelineProps {
  selectedDate: dayjs.Dayjs;
  userData?: {
    user?: {
      email?: string | null;
    };
  } | null;
  userCategories?: Array<{
    name: string;
    color?: string;
  }>;
  selectedTimeEntries?: SelectedTimeEntry[] | null;
  refreshTrigger?: number;
}

const DayTimeline = React.memo((props: DayTimelineProps) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down('md'));
  const [userDayTimeEntries, setUserDayTimeEntries] = useState([{"category": "", "time": ""}]);

  const categoryColorMap = useMemo(() => {
    if (!props.userCategories) return new Map();
    return new Map(props.userCategories.map(category => [category.name, category.color]));
  }, [props.userCategories]);

  const sortTimeEntriesByTime = useCallback((timeEntries: any) => {
    if(timeEntries.length == 1) { return timeEntries }
    return [...timeEntries].sort((a, b) => {
      return a.time.localeCompare(b.time);  
    })
  }, []);

  const formatTimeString = useCallback((timeString: string, selectedDate: dayjs.Dayjs) => {
    return dayjs(selectedDate.format("YYYY-MM-DD")+timeString).format("hh:mm A");
  }, []);

  const getCategoryColorByName = useCallback((name: string) => {
    return categoryColorMap.get(name);
  }, [categoryColorMap]);

  const convertSelectedTimeEntries = useCallback((selectedTimeEntries: SelectedTimeEntry[]) => {
    return selectedTimeEntries.map((timeEntry: SelectedTimeEntry) => {
      return {
        "category": timeEntry.category,
        "time": timeEntry.time.format("THH:mm:ssZ"),
        "type": "selected"
      }
    })
  }, []);

  const CombineTimeEntries = useCallback((timeEntriesO: TimeEntry[], timeEntriesI: TimeEntry[]) => {
    const overridingEntriesMap = new Map(timeEntriesO.map(entry => [entry.time, entry]));
    const InitialEntriesSet = new Set(timeEntriesI.map(entry => entry.time));
    
    const combined = timeEntriesI.map(timeEntry => 
      overridingEntriesMap.get(timeEntry.time) ?? timeEntry
    );
    
    combined.push(...timeEntriesO.filter(entry => !InitialEntriesSet.has(entry.time)));
    
    return combined;
  }, []);

  useEffect(() => {
      const getUserDayCategories = async() => {
        if(props.selectedDate && props.selectedDate != undefined){
          GetDailyEntryTimes(props.userData?.user?.email, props.selectedDate).then((timeEntries) => {
            let baseEntries: TimeEntry[] = DEFAULT_DAY_TIME_ENTRIES;
            if(timeEntries){
              const mappedTimeEntries = timeEntries.map((timeEntry) => ({
                ...timeEntry,
                type: "existing"
              }));
              baseEntries = CombineTimeEntries(mappedTimeEntries, DEFAULT_DAY_TIME_ENTRIES);
            }
            let finalEntries = baseEntries;
            if(props.selectedTimeEntries){
              finalEntries = CombineTimeEntries(convertSelectedTimeEntries(props.selectedTimeEntries)!, baseEntries);
            }
            
            setUserDayTimeEntries(sortTimeEntriesByTime(finalEntries));
          });
        }
      }
      getUserDayCategories();
    }, [props.selectedDate, props.userData?.user?.email, props.selectedTimeEntries, props.refreshTrigger, sortTimeEntriesByTime, CombineTimeEntries, convertSelectedTimeEntries]);
    
  const firstHalfEntries = useMemo(() => 
    userDayTimeEntries.slice(0, userDayTimeEntries.length / 2),
    [userDayTimeEntries]
  );
  
  const secondHalfEntries = useMemo(() => 
    userDayTimeEntries.slice(userDayTimeEntries.length / 2),
    [userDayTimeEntries]
  );

  const determineTimelineDotSX =  useCallback((timeEntry: TimeEntry) => {
    const existingTimeEntrySX = {backgroundColor: getCategoryColorByName(timeEntry?.category)}
    const selectedTimeEntrySX = {borderColor: getCategoryColorByName(timeEntry?.category)}
    if(!timeEntry.type){return existingTimeEntrySX}
    return (timeEntry.type == "selected" ? selectedTimeEntrySX : existingTimeEntrySX);
  }, []);

  return (
    <div className={`${styles.DayTimeline} ${isBelowMd ? styles.stretch : ''}`}>
      <Timeline
        sx={{
          [`& .${timelineContentClasses.root}`]: {
            flex: 0.5,
          },
          [`& .${timelineOppositeContentClasses.root}`]: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0,
          },
        }}
      >
        {firstHalfEntries.map(function(timeEntry: TimeEntry, index, {length}){
          return(
            <div key={index}>
            <TimelineItem>
              <TimelineOppositeContent>{timeEntry.category}</TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot sx={determineTimelineDotSX(timeEntry)} />
                {(index + 1 != length) && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent color="text.secondary">{formatTimeString(timeEntry.time, props.selectedDate)}</TimelineContent>
            </TimelineItem>
            </div>
          );
        })}
      </Timeline>
      <Timeline
        sx={{
          [`& .${timelineContentClasses.root}`]: {
            flex: 0.5,
          },
          [`& .${timelineOppositeContentClasses.root}`]: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0,
          },
        }}
      >
        {secondHalfEntries.map(function(timeEntry: TimeEntry, index, {length}){
          return(
            <div key={userDayTimeEntries.length / 2 + index}>
            <TimelineItem>
              <TimelineOppositeContent>{timeEntry.category}</TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot sx={determineTimelineDotSX(timeEntry)} />
                {(index + 1 != length) && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent color="text.secondary">{formatTimeString(timeEntry.time, props.selectedDate)}</TimelineContent>
            </TimelineItem>
            </div>
          );
        })}
      </Timeline>
    </div>
  );
})

DayTimeline.displayName = 'DayTimeline';

export default DayTimeline;