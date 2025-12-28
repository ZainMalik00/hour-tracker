import React, { useEffect, useState } from 'react';
import styles from './day-timeline.module.css';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent, { timelineContentClasses } from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import dayjs from 'dayjs';
import { GetDailyEntryTimes } from '../../backend/user-stories/daily/get-daily-entry-times/get-daily-entry-times';

interface TimeEntry {
  category: string,
  time: string,
} 

const createDefaultDayTimeEntries = () => {
    let defaultDTE: TimeEntry[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      let date = dayjs({hour: hour});
      defaultDTE.push({category : "", "time" : date.format("THH:mm:ssZ")});
      date = dayjs({hour: hour, minute: 30});
      defaultDTE.push({category : "", "time" : date.format("THH:mm:ssZ")});
    }
    return defaultDTE;
}


const DayTimeline = (props) => {
  const [userDayTimeEntries, setUserDayTimeEntries] = useState([{"category": "", "time": ""}]);
  const [DefaultDayTimeEntries, setDefaultDayTimeEntries] = useState(createDefaultDayTimeEntries());

  useEffect(() => {
      const getUserDayCategories = async() => {
        if(props.selectedDate && props.selectedDate != undefined){
          GetDailyEntryTimes(props.userData?.user?.email, props.selectedDate).then((timeEntries) => {
            if(timeEntries){
              setUserDayTimeEntries(sortTimeEntriesByTime(timeEntries!));
            } else {
              setUserDayTimeEntries(DefaultDayTimeEntries);
            }
          });
        }
      }
      console.log(props.selectedDate.format("YYYY-MM-DD"))
      getUserDayCategories();
    }, [props.selectedDate]);

    const sortTimeEntriesByTime = (timeEntries: any) => {
      if(timeEntries.length == 1) { return timeEntries }
      return [...timeEntries].sort((a, b) => {
        return a.time.localeCompare(b.time);  
      })
    };

    const formatTimeString = (timeString: string) => {
      return(dayjs(props.selectedDate.format("YYYY-MM-DD")+timeString).format("hh:mm A"))
    };

    const getCategoryColorByName = (name: string) => {
      return (props.userCategories?.find(category => category.name == name)?.color); 
    }

  return (
    <div className={styles.DayTimeline}>
      <Timeline
        sx={{
          [`& .${timelineContentClasses.root}`]: {
            flex: 0.5,
          },
        }}
      >
        {userDayTimeEntries.slice(0, userDayTimeEntries.length / 2).map(function(TimeEntry, index, {length}){
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
              <TimelineContent color="text.secondary">{formatTimeString(TimeEntry?.time)}</TimelineContent>
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
        {userDayTimeEntries.slice(userDayTimeEntries.length / 2).map(function(TimeEntry, index, {length}){
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
              <TimelineContent color="text.secondary">{formatTimeString(TimeEntry?.time)}</TimelineContent>
            </TimelineItem>
            </div>
          );
        })}
      </Timeline>
    </div>
  );
}

DayTimeline.propTypes = {};
DayTimeline.defaultProps = {};

export default DayTimeline;