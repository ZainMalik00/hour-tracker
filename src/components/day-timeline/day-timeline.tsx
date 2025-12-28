import React, { useEffect, useState, useMemo, useCallback } from 'react';
import styles from './day-timeline.module.css';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent, { timelineContentClasses } from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import dayjs from 'dayjs';
import objectSupport from 'dayjs/plugin/objectSupport';
import { GetDailyEntryTimes } from '../../backend/user-stories/daily/get-daily-entry-times/get-daily-entry-times';

dayjs.extend(objectSupport);

interface TimeEntry {
  category: string,
  time: string,
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
}

const DayTimeline = React.memo((props: DayTimelineProps) => {
  const [userDayTimeEntries, setUserDayTimeEntries] = useState([{"category": "", "time": ""}]);

  // Memoize category color map for O(1) lookups instead of O(n) find operations
  const categoryColorMap = useMemo(() => {
    if (!props.userCategories) return new Map();
    return new Map(props.userCategories.map(category => [category.name, category.color]));
  }, [props.userCategories]);

  // Memoize sorted entries
  const sortTimeEntriesByTime = useCallback((timeEntries: any) => {
    if(timeEntries.length == 1) { return timeEntries }
    return [...timeEntries].sort((a, b) => {
      return a.time.localeCompare(b.time);  
    })
  }, []);

  // Memoize format function
  const formatTimeString = useCallback((timeString: string, selectedDate: dayjs.Dayjs) => {
    return dayjs(selectedDate.format("YYYY-MM-DD")+timeString).format("hh:mm A");
  }, []);

  // Optimized color lookup using Map
  const getCategoryColorByName = useCallback((name: string) => {
    return categoryColorMap.get(name);
  }, [categoryColorMap]);

  useEffect(() => {
      const getUserDayCategories = async() => {
        if(props.selectedDate && props.selectedDate != undefined){
          GetDailyEntryTimes(props.userData?.user?.email, props.selectedDate).then((timeEntries) => {
            if(timeEntries){
              setUserDayTimeEntries(sortTimeEntriesByTime(timeEntries!));
            } else {
              console.log(DEFAULT_DAY_TIME_ENTRIES)
              setUserDayTimeEntries(DEFAULT_DAY_TIME_ENTRIES);
            }
          });
        }
      }
      getUserDayCategories();
    }, [props.selectedDate, props.userData?.user?.email, sortTimeEntriesByTime]);


  const firstHalfEntries = useMemo(() => 
    userDayTimeEntries.slice(0, userDayTimeEntries.length / 2),
    [userDayTimeEntries]
  );
  
  const secondHalfEntries = useMemo(() => 
    userDayTimeEntries.slice(userDayTimeEntries.length / 2),
    [userDayTimeEntries]
  );

  return (
    <div className={styles.DayTimeline}>
      <Timeline
        sx={{
          [`& .${timelineContentClasses.root}`]: {
            flex: 0.5,
          },
        }}
      >
        {firstHalfEntries.map(function(TimeEntry, index, {length}){
          return(
            <div key={index}>
            <TimelineItem>
              <TimelineOppositeContent>{TimeEntry?.category}</TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot sx={{ 
                  backgroundColor: getCategoryColorByName(TimeEntry?.category)
                }} />
                {(index + 1 != length) && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent color="text.secondary">{formatTimeString(TimeEntry?.time, props.selectedDate)}</TimelineContent>
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
        }}
      >
        {secondHalfEntries.map(function(TimeEntry, index, {length}){
          return(
            <div key={userDayTimeEntries.length / 2 + index}>
            <TimelineItem>
              <TimelineOppositeContent>{TimeEntry?.category}</TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot sx={{ 
                  backgroundColor: getCategoryColorByName(TimeEntry?.category)
                }} />
                {(index + 1 != length) && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent color="text.secondary">{formatTimeString(TimeEntry?.time, props.selectedDate)}</TimelineContent>
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