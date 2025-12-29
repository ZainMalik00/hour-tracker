import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import styles from './insert-page-container.module.css';
import { useSession } from 'next-auth/react';
import { useTheme, useMediaQuery, Card } from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import objectSupport from 'dayjs/plugin/objectSupport';
import timezone from 'dayjs/plugin/timezone';
import { GetCategories } from '../../backend/user-stories/categories/get-categories/get-categories';
import { DefaultCategories } from '../../backend/entities/DefaultCategories';
import HourEntryForm, { TimeEntry } from '../hour-entry-form/hour-entry-form';
import DayTimeline from '../day-timeline/day-timeline';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(objectSupport);

interface InsertPageContainerProps {
  selectedDate: dayjs.Dayjs;
  onSelectedDateChange: (date: dayjs.Dayjs) => void;
  onTimeEntriesChange?: (length: number) => void;
}

const InsertPageContainer = ({ selectedDate, onSelectedDateChange, onTimeEntriesChange }: InsertPageContainerProps) => {
  const { data: userData } = useSession();
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down('md'));
  const [userCategories, setUserCategories] = useState(DefaultCategories);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const prevEmailRef = useRef<string | undefined>(userData?.user?.email);
  const onTimeEntriesChangeRef = useRef(onTimeEntriesChange);

  useEffect(() => {
    onTimeEntriesChangeRef.current = onTimeEntriesChange;
    
    const currentEmail = userData?.user?.email;
    if (currentEmail !== prevEmailRef.current) {
      prevEmailRef.current = currentEmail;
      if (currentEmail) {
        GetCategories(currentEmail).then((categoryList) => {
          setUserCategories(categoryList!);
        });
      }
    }
  }, [onTimeEntriesChange, userData?.user?.email]);

  const handleTimeEntriesChange = useCallback((newTimeEntries: TimeEntry[]) => {
    setTimeEntries(newTimeEntries);
    if (onTimeEntriesChangeRef.current) {
      onTimeEntriesChangeRef.current(newTimeEntries.length);
    }
  }, []);

  const handleFormSubmit = useCallback(() => {
    setTimeEntries([]);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const memoizedUserData = useMemo(() => {
    return userData || undefined;
  }, [userData]);

  return (
    <div className={`${styles.PageContents} ${isBelowMd ? styles.column : ''}`}>
      <HourEntryForm
        selectedDate={selectedDate}
        onSelectedDateChange={onSelectedDateChange}
        timeEntries={timeEntries}
        onTimeEntriesChange={handleTimeEntriesChange}
        userCategories={userCategories}
        userData={memoizedUserData}
        onSubmit={handleFormSubmit}
      />
      <Card sx={{flex: "1 1 40%", maxHeight: "74vh", overflow: "auto"}}>
        <DayTimeline
          selectedDate={selectedDate}
          userData={memoizedUserData}
          userCategories={userCategories}
          selectedTimeEntries={timeEntries}
          refreshTrigger={refreshTrigger}
        />
      </Card>
    </div>
  );
};

export default InsertPageContainer;

