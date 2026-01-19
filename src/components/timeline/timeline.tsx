import React, { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineOppositeContent, TimelineSeparator } from '@mui/lab';
import { CategoryEntry, DefaultCategories } from '../../backend/entities/DefaultCategories';
import { DayEntry } from '../../backend/entities/Entries';
import { TimeEntry } from '../../backend/entities/Entries';
import styles from './timeline.module.css';

interface TimelineProps {
  userCategories: CategoryEntry[];
  userDayEntries: DayEntry[];
  selectedDate: dayjs.Dayjs;
}

export default function TimelineComponent({ userCategories, userDayEntries, selectedDate }: TimelineProps) {
  const categoryMap = useMemo(() => {
    if (!userCategories) return new Map<string, CategoryEntry>(DefaultCategories.map(category => [category.id, category]));
    return new Map(userCategories.map(category => [category.id, category]));
  }, [userCategories]);

  const getCategoryNameById = useCallback((id: string) => {
    return categoryMap.get(id)?.name || id;
  }, [categoryMap]);

  const halfHourIntervals = useMemo(() => {
    const intervals: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const h = hour < 10 ? `0${hour}` : `${hour}`;
        const m = minute < 10 ? `0${minute}` : `${minute}`;
        intervals.push(`${h}:${m}`);
      }
    }
    return intervals;
  }, []);

  const mostCommonCategoryByInterval = useMemo(() => {
    const year = selectedDate.year().toString();
    
    const result = halfHourIntervals.map(time => ({
      time,
      category: '',
      count: 0
    }));

    if (!userDayEntries || userDayEntries.length === 0) { return result; }

    const filteredEntries = userDayEntries
      .filter((dayEntry: DayEntry) => dayEntry.date.substring(0, 4) === year)
      .flatMap((dayEntry: DayEntry) => dayEntry.timeEntries || [])
      .filter((timeEntry: TimeEntry | null) => timeEntry !== null) as TimeEntry[];

    // Create a Map for each time interval to count categories
    // Key: time string (e.g., "14:30"), Value: Map<categoryId, count>
    const intervalCategoryCounts = new Map<string, Map<string, number>>();
    
    halfHourIntervals.forEach(time => { intervalCategoryCounts.set(time, new Map<string, number>()); });

    filteredEntries.forEach((timeEntry: TimeEntry) => {
      let timeString: string;
      const timeValue = timeEntry.time as any;
      
      if (typeof timeValue === 'string') { timeString = timeValue.substring(1, 6); } // If it's a string, extract HH:mm from format "THH:mm:ssZ"
      else if (timeValue && typeof timeValue.format === 'function') { timeString = timeValue.format('HH:mm'); } // If it's a dayjs object, format it as HH:mm
      else { return; }

      const categoryCounts = intervalCategoryCounts.get(timeString);
      if (!categoryCounts) { return; }

      // Increment count for this category
      const categoryId = timeEntry.category || '';
      const currentCount = categoryCounts.get(categoryId) || 0;
      categoryCounts.set(categoryId, currentCount + 1);
    });

    // Find the most common category for each interval
    halfHourIntervals.forEach((timeString, index) => {
      const categoryCounts = intervalCategoryCounts.get(timeString);
      if (!categoryCounts) return;

      let maxCount = 0;
      let mostCommonCategory = '';

      categoryCounts.forEach((count, categoryId) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommonCategory = categoryId;
        }
      });

      result[index] = {
        time: timeString,
        category: mostCommonCategory,
        count: maxCount
      };
    });

    return result;
  }, [userDayEntries, selectedDate, halfHourIntervals]);

  const formatTimeString = useCallback((timeString: string) => {
    return dayjs(selectedDate.format("YYYY-MM-DD")+timeString).format("hh:mm A");
  }, [selectedDate]);

  return (
    <Timeline
      className={styles.timeline}
    >
      {mostCommonCategoryByInterval.map(function(timeEntry: { time: string; category: string; count: number; }, index, {length}){
        return(
          <TimelineItem key={index}>
            <TimelineOppositeContent>{getCategoryNameById(timeEntry.category)}</TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot 
                className={styles.timelineDot}
                style={{ '--category-color': categoryMap.get(timeEntry.category)?.color || 'transparent' } as React.CSSProperties}
              />
              {(index + 1 != length) && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent color="text.secondary">{formatTimeString(timeEntry.time)}</TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}
