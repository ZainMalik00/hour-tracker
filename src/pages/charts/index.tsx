import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { PageContainer, PageHeader, PageHeaderToolbar } from '@toolpad/core/PageContainer';
import { useSession } from 'next-auth/react';
import { TimeEntry } from '../../components/hour-entry-form/hour-entry-form';
import { GetDays } from '../../backend/user-stories/daily/get-daily-entries/get-daily-entries';
import { Box, Button, Card, Typography } from '@mui/material';
import { GetCategories } from '../../backend/user-stories/categories/get-categories/get-categories';
import { DefaultCategories } from '../../backend/entities/DefaultCategories';
import { GetChartConfigs } from '../../backend/user-stories/charts/get-chart-configs.ts/get-chart-configs';
import { UpdateChartConfigs } from '../../backend/user-stories/charts/update-chart-configs/update-chart-configs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import { ChartConfig } from '../../backend/entities/ChartConfig';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import ChartsGrid from '../../components/charts-grid/charts-grid';
import { ChartType } from '../../backend/services/chart-service';
import { DefaultizedPieValueType, PieChart } from '@mui/x-charts';

dayjs.extend(isLeapYear);
export interface DayEntry {
  date: string;
  dayOfWeek: string;
  week: number;
  timeEntries: TimeEntry[] | null;
} 

export interface WeekEntry {
  week: number;
  timeEntries: TimeEntry[] | null;
}

export interface DayOfWeekEntry {
  dayOfWeek: number;
  timeEntries: TimeEntry[] | null;
}

export interface HourlyEntry {
  hour: string;
  timeEntries: TimeEntry[] | null;
}

export interface PieChartData {
  id: number;
  value: number;
  label: string;
  color: string;
}

function CustomPageToolbar({ selectedDate, onSelectedDateChange, isEditing, toggleIsEditing }: { selectedDate: dayjs.Dayjs; onSelectedDateChange: (date: dayjs.Dayjs) => void; isEditing: boolean; toggleIsEditing: () => void }) {

    return (
      <PageHeaderToolbar>
        <Button 
            size='large'
            variant="outlined" 
            startIcon={<DesignServicesIcon />} 
            sx={{ height: '40px' }}
            onClick={toggleIsEditing}
        >
            Edit
        </Button>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker 
                label="Year"
                views={['year']}
                value={selectedDate}
                onChange={(value) => { if(value){ onSelectedDateChange(value) }}} 
                sx={{ maxWidth: '115px' }}
                slotProps={{ textField: { size: 'small' } }}
            />
        </LocalizationProvider>
      </PageHeaderToolbar>
    );
  }
  
  function CustomPageHeader({ status, selectedDate, onSelectedDateChange, isEditing, toggleIsEditing }: { status: string; selectedDate: dayjs.Dayjs; onSelectedDateChange: (date: dayjs.Dayjs) => void; isEditing: boolean; toggleIsEditing: () => void }) {
    const CustomPageToolbarComponent = React.useCallback(
      () => <CustomPageToolbar selectedDate={selectedDate} onSelectedDateChange={onSelectedDateChange} isEditing={isEditing} toggleIsEditing={toggleIsEditing} />,
      [status, selectedDate, onSelectedDateChange, isEditing, toggleIsEditing],
    );
  
    return <PageHeader slots={{ toolbar: CustomPageToolbarComponent }} />;
  }

export default function ChartsPage() {
    const { data: userData } = useSession();
    const [ userCategories, setUserCategories ] = useState(DefaultCategories);
    const [ dayEntries, setDayEntries ] = useState<DayEntry[]>([]);
    const [ numOfWeeklyCharts, setNumOfWeeklyCharts ] = useState(4);
    const [ numOfDailyCharts, setNumOfDailyCharts ] = useState(4);
    const [ numOfHourlyCharts, setNumOfHourlyCharts ] = useState(4);
    const [ weeklyChartConfigs, setWeeklyChartConfigs ] = useState<ChartConfig[]>([]);
    const [ dailyChartConfigs, setDailyChartConfigs ] = useState<ChartConfig[]>([]);
    const [ hourlyChartConfigs, setHourlyChartConfigs ] = useState<ChartConfig[]>([]);
    const [ selectedDate, setSelectedDate ] = useState(dayjs().year());
    const [ isEditing, setIsEditing ] = useState(false);
    const lastSavedWeeklyChartConfigsRef = useRef<ChartConfig[]>([]);
    const lastSavedDailyChartConfigsRef = useRef<ChartConfig[]>([]);
    const lastSavedHourlyChartConfigsRef = useRef<ChartConfig[]>([]);

    const handleSelectedDateChange = React.useCallback((date: dayjs.Dayjs) => {
        setSelectedDate(date.year());
    }, []);

    const areChartConfigsEqual = useCallback((configs1: ChartConfig[], configs2: ChartConfig[]): boolean => {
        if (configs1.length !== configs2.length) {
            return false;
        }
        return configs1.every((config1, index) => {
            const config2 = configs2[index];
            return config1.selectedCategory === config2.selectedCategory &&
                   config1.sumType === config2.sumType &&
                   config1.type === config2.type &&
                   (config1.index === undefined ? config2.index === undefined : config1.index === config2.index);
        });
    }, []);

    const updateChartConfigs = React.useCallback(async () => {
        if(!userData?.user?.email){ return; }

        const isDailyConfigsEqual = areChartConfigsEqual(dailyChartConfigs, lastSavedDailyChartConfigsRef.current);
        const isWeeklyConfigsEqual = areChartConfigsEqual(weeklyChartConfigs, lastSavedWeeklyChartConfigsRef.current);
        const isHourlyConfigsEqual = areChartConfigsEqual(hourlyChartConfigs, lastSavedHourlyChartConfigsRef.current);
        if (isDailyConfigsEqual && isWeeklyConfigsEqual && isHourlyConfigsEqual && isHourlyConfigsEqual) { return; }

        try {
            if(!isDailyConfigsEqual) {
                await UpdateChartConfigs(userData.user.email, dailyChartConfigs, ChartType.DAILY);
                lastSavedDailyChartConfigsRef.current = JSON.parse(JSON.stringify(dailyChartConfigs));
            }
            if(!isWeeklyConfigsEqual) {
                await UpdateChartConfigs(userData.user.email, weeklyChartConfigs, ChartType.WEEKLY);
                lastSavedWeeklyChartConfigsRef.current = JSON.parse(JSON.stringify(weeklyChartConfigs));
            }
            if(!isHourlyConfigsEqual) {
                await UpdateChartConfigs(userData.user.email, hourlyChartConfigs, ChartType.HOURLY);
                lastSavedHourlyChartConfigsRef.current = JSON.parse(JSON.stringify(hourlyChartConfigs));
            }
        } catch (error) {
            console.error('Error updating chart configs:', error);
        }
    }, [userData?.user?.email, weeklyChartConfigs, dailyChartConfigs, hourlyChartConfigs, areChartConfigsEqual]);

    const toggleIsEditing = React.useCallback(async () => {
        if (isEditing) { await updateChartConfigs(); }
        setIsEditing(prev => !prev);
    }, [isEditing, updateChartConfigs]);

    const CustomPageHeaderComponent = React.useCallback(
        () => <CustomPageHeader status="" selectedDate={dayjs().year(selectedDate)} onSelectedDateChange={handleSelectedDateChange} isEditing={isEditing} toggleIsEditing={toggleIsEditing} />,
        [selectedDate, handleSelectedDateChange, isEditing, toggleIsEditing],
    );

    const getCorrectWeek = useCallback((dayEntry: DayEntry) => {
        const month = dayEntry.date.substring(5, 7);
        if(month === "12" && dayEntry.week === 1 ){ return 53; }
        if(month === "12" && dayEntry.week === 2 ){ return 54; }
        return dayEntry.week;
    }, []);

    const createWeekEntries = useCallback((dayEntries: DayEntry[], year: number): any[] => {
        // Initialize combinedMap with minimum 52 weeks (always include weeks 1-52)
        const combinedMap: { [key: number]: any } = {};
        for (let week = 1; week <= 52; week++) {
            combinedMap[week] = {
                week: week,
                timeEntries: null
            };
        }
        
        if (!dayEntries || dayEntries.length === 0) { return Object.values(combinedMap); }

        const yearString = year.toString();
        const filteredEntries = dayEntries.filter(dayEntry => dayEntry.date.substring(0, 4) === yearString); // substring is the year

        filteredEntries.forEach((dayEntry) => {
            const commonWeek = getCorrectWeek(dayEntry);
            dayEntry.week = commonWeek;

            if (commonWeek >= 1 && commonWeek <= 54) {
                // Add week 53 or 54 to map if not already present
                if (commonWeek === 53 && !combinedMap[53]) {
                    combinedMap[53] = { week: 53, timeEntries: null };
                }
                if (commonWeek === 54 && !combinedMap[54]) {
                    combinedMap[54] = { week: 54, timeEntries: null };
                }
                
                if (!combinedMap[commonWeek].timeEntries) {
                    const { date, dayOfWeek, ...dayEntryReduced } = dayEntry;
                    combinedMap[commonWeek].timeEntries = [dayEntryReduced.timeEntries];
                } else {
                    combinedMap[commonWeek].timeEntries.push(dayEntry.timeEntries);
                }
            }
        });

        return Object.values(combinedMap);
    }, []);

    const createDayOfWeekEntries = useCallback((dayEntries: DayEntry[], year: number): DayOfWeekEntry[] => { 
        const yearString = year.toString();
        const combinedMap: { [key: number]: DayOfWeekEntry } = {};

        for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
            combinedMap[dayOfWeek] = {
                dayOfWeek: dayOfWeek,
                timeEntries: null
            };
        }
        
        dayEntries.forEach((dayEntry) => {
            if (dayEntry.date.substring(0, 4) !== yearString) { return; }
            
            const entryDayOfWeek = typeof dayEntry.dayOfWeek === 'string' ? parseInt(dayEntry.dayOfWeek, 10) : dayEntry.dayOfWeek;
            
            // Validate dayOfWeek is in valid range
            if (entryDayOfWeek >= 0 && entryDayOfWeek <= 6 && dayEntry.timeEntries !== null) {
                const existingEntries = combinedMap[entryDayOfWeek].timeEntries;
                if (existingEntries === null) {
                    combinedMap[entryDayOfWeek].timeEntries = dayEntry.timeEntries.slice();
                } else {
                    combinedMap[entryDayOfWeek].timeEntries = existingEntries.concat(dayEntry.timeEntries);
                }
            }
        });
        
        return Object.values(combinedMap) as DayOfWeekEntry[];
    }, [dayEntries]);


    const createHourlyEntries = useCallback((dayEntries: DayEntry[], year: number): HourlyEntry[] => {
        const yearString = year.toString();
        const combinedMap: { [key: number]: any } = {};
        const timeIntervalToIndexMap = new Map<string, number>();
        
        for (let hour = 0; hour <= 47; hour+=2) {
            const hourValue = hour / 2;
            const hourStr = hourValue < 10 ? "0" + hourValue + ":00" : hourValue + ":00";
            const halfHourStr = hourValue < 10 ? "0" + hourValue + ":30" : hourValue + ":30";
            
            combinedMap[hour] = {
                hour: hourStr,
                timeEntries: []
            };
            combinedMap[hour + 1] = {
                hour: halfHourStr,
                timeEntries: []
            };
            timeIntervalToIndexMap.set(hourStr, hour);
            timeIntervalToIndexMap.set(halfHourStr, hour + 1);
        }

        if (!dayEntries || dayEntries.length === 0) { return Object.values(combinedMap); }

        const filteredEntries = dayEntries.filter(dayEntry => dayEntry.date.substring(0, 4) === yearString);

        filteredEntries.forEach((dayEntry) => {
            if (!dayEntry.timeEntries) { return; }
            
            dayEntry.timeEntries.forEach((timeEntry: TimeEntry) => {
                // Handle both string format ("T14:30:00Z") and dayjs object
                let timeString: string;
                const timeValue = timeEntry.time as any;
                if (typeof timeValue === 'string') {
                    // If it's a string, extract HH:mm from format "THH:mm:ssZ"
                    timeString = timeValue.substring(1, 6);
                } else if (timeValue && typeof timeValue.format === 'function') {
                    // If it's a dayjs object, format it as HH:mm
                    timeString = timeValue.format('HH:mm');
                } else { return; }
                
                const index = timeIntervalToIndexMap.get(timeString);
                if (index !== undefined) {
                    combinedMap[index].timeEntries.push(timeEntry);  
                }
            });
        });

        return Object.values(combinedMap);
    }, [dayEntries]);

    const sortWeekEntriesByTime = useCallback((weekEntries: WeekEntry[]) => {
        if(weekEntries.length == 1) { return weekEntries }
        return [...weekEntries].sort((a, b) => a.week - b.week)
    }, []);

    const isSelectedYearLeapYear = useMemo(() => {
        return dayjs().year(selectedDate).isLeapYear();
    }, [selectedDate]);

    const getTotalTimeEntriesHours = useCallback((entries: DayOfWeekEntry[] | HourlyEntry[]): number => {
        return entries.flatMap((entry) =>  entry.timeEntries).length / 2;
    }, []);

    const getTotalTimeEntriesHoursByCategory = useCallback((category: string, entry: WeekEntry | DayOfWeekEntry | HourlyEntry): number => {
        if (!entry.timeEntries) { return 0; }
        // Handles both nested arrays (WeekEntry) and flat arrays (DayOfWeekEntry, HourlyEntry)
        let count = 0;
        const timeEntries = entry.timeEntries;
        for (let i = 0; i < timeEntries.length; i++) {
            const timeEntry = timeEntries[i];
            if (timeEntry === null) { continue; }
            
            if (Array.isArray(timeEntry)) {
                // Nested array case (WeekEntry)
                for (let j = 0; j < timeEntry.length; j++) {
                    const nestedTimeEntry = timeEntry[j];
                    if (nestedTimeEntry && nestedTimeEntry.category === category) { count++; }
                }
            } else if (timeEntry && timeEntry.category === category) { count++; } // Flat array case (DayOfWeekEntry, HourlyEntry)
        }
        return count / 2;
    }, []);

    const getAverageTimeEntriesHoursByCategory = useCallback((category: string, entry: WeekEntry | DayOfWeekEntry | HourlyEntry, chartType: ChartType): number => {
        if (!entry.timeEntries) { return 0; }
        let totalTimeEntries = 0;
        if(chartType === ChartType.WEEKLY) {
            totalTimeEntries = 14;
        } else if(chartType === ChartType.DAILY) {
            totalTimeEntries = isSelectedYearLeapYear ? 366 : 365;
        }
        // Handles both nested arrays (WeekEntry) and flat arrays (DayOfWeekEntry, HourlyEntry)
        let count = 0;
        const timeEntries = entry.timeEntries;
        for (let i = 0; i < timeEntries.length; i++) {
            const timeEntry = timeEntries[i];
            if (timeEntry === null) { continue; }      
            
            if (Array.isArray(timeEntry)) {
                // Nested array case (WeekEntry)
                for (let j = 0; j < timeEntry.length; j++) {
                    const nestedTimeEntry = timeEntry[j];
                    if (nestedTimeEntry && nestedTimeEntry.category === category) { count++; }
                }
            } else if (timeEntry && timeEntry.category === category) { count++; } // Flat array case (DayOfWeekEntry, HourlyEntry)
        }
        return count / totalTimeEntries;
    }, [isSelectedYearLeapYear]);

    const createPieChartData = useCallback((entries: DayOfWeekEntry[] | HourlyEntry[]): PieChartData[] => {
        const data: PieChartData[] = [];
        if (!entries || !Array.isArray(entries)) { return []; }
        
        const allTimeEntries = entries.flatMap((entry) => entry.timeEntries || []);
        
        userCategories.forEach((categoryEntry, index) => {
            const count = allTimeEntries.filter((timeEntry) => timeEntry && timeEntry.category === categoryEntry.name).length;
            data.push({ 
                id: index, 
                value: count / 2, 
                label: categoryEntry.name, 
                color: categoryEntry.color 
            });
        })   
        return data;
    }, [userCategories]);
    
    const convertDayOfWeekToDayOfWeekName = useCallback((dayOfWeek: number) => {
        switch(dayOfWeek) {
            case 0: return "Sun";
            case 1: return "Mon";
            case 2: return "Tue";
            case 3: return "Wed";
            case 4: return "Thu";
            case 5: return "Fri";
            case 6: return "Sat";
        }
        return "";
    }, []);

    const createWeekEntriesBarChartData = useCallback((category: string, type: "total" | "average", weekEntries: any[]): { xData: number[]; yData: number[] } => {
        const xData: number[] = [];
        const yData: number[] = [];
        if (!weekEntries || !Array.isArray(weekEntries)) { return { xData, yData }; }
        weekEntries.forEach((weekEntry) => {
            xData.push(weekEntry.week);
            yData.push(type === "total" ? getTotalTimeEntriesHoursByCategory(category, weekEntry) : getAverageTimeEntriesHoursByCategory(category, weekEntry, ChartType.WEEKLY));
        })
        return { xData, yData };
    }, [getTotalTimeEntriesHoursByCategory, getAverageTimeEntriesHoursByCategory]);
    
    const convertHourToHourName = useCallback((hour: string) => {
        const hourNum = parseInt(hour.substring(0, 2), 10);
        const minutes = hour.substring(3); // Extract minutes (skip "HH:")
        const period = hourNum < 12 ? 'AM' : 'PM';
        const displayHour = hourNum === 0 ? 12 : (hourNum > 12 ? hourNum - 12 : hourNum);
        return `${displayHour}:${minutes} ${period}`;
    }, []);
    
    const createDayOfWeekEntriesBarChartData = useCallback((category: string, type: "total" | "average", dayOfWeekEntries: DayOfWeekEntry[]): { xData: string[]; yData: number[] } => {
        const xData: string[] = [];
        const yData: number[] = [];
        if (!dayOfWeekEntries || !Array.isArray(dayOfWeekEntries)) { return { xData, yData }; }
        dayOfWeekEntries.forEach((dayOfWeekEntry) => {
            xData.push(convertDayOfWeekToDayOfWeekName(dayOfWeekEntry.dayOfWeek as number));
            yData.push(type === "total" ? getTotalTimeEntriesHoursByCategory(category, dayOfWeekEntry) : getAverageTimeEntriesHoursByCategory(category, dayOfWeekEntry, ChartType.DAILY));
        })
        return { xData, yData };
    }, [getTotalTimeEntriesHoursByCategory, getAverageTimeEntriesHoursByCategory, convertDayOfWeekToDayOfWeekName]);    

    const createHourlyEntriesBarChartData = useCallback((category: string, type: "total" | "average", hourlyEntries: any[]): { xData: string[]; yData: number[] } => {
        const xData: string[] = [];
        const yData: number[] = [];
        if (!hourlyEntries || !Array.isArray(hourlyEntries)) { return { xData, yData }; }
        hourlyEntries.forEach((hourlyEntry) => {
            xData.push(convertHourToHourName(hourlyEntry.hour));
            yData.push(type === "total" ? getTotalTimeEntriesHoursByCategory(category, hourlyEntry) : getAverageTimeEntriesHoursByCategory(category, hourlyEntry, ChartType.HOURLY));
        })
        return { xData, yData };
    }, [getTotalTimeEntriesHoursByCategory, getAverageTimeEntriesHoursByCategory]);

    const sortChartConfigsByIndex = useCallback((chartConfigs: ChartConfig[]) => {
        return [...chartConfigs].sort((a, b) => (a.index || 0) - (b.index || 0));
    }, []);

    // Fetch chartConfigs when user email changes
    useEffect(() => {
        if(!userData?.user?.email){ return }
        
        GetChartConfigs(userData?.user?.email, ChartType.WEEKLY).then((savedConfigs) => {
            if (savedConfigs && savedConfigs.length > 0) {
                const sortedConfigs = sortChartConfigsByIndex(savedConfigs);
                setWeeklyChartConfigs(sortedConfigs);
                setNumOfWeeklyCharts(savedConfigs.length);
                lastSavedWeeklyChartConfigsRef.current = JSON.parse(JSON.stringify(sortedConfigs));
            }
        }).catch((error) => {
            console.error('Error fetching weekly chart configs:', error);
        });
        
        GetChartConfigs(userData?.user?.email, ChartType.DAILY).then((savedConfigs) => {
            if (savedConfigs && savedConfigs.length > 0) {
                const sortedConfigs = sortChartConfigsByIndex(savedConfigs);
                setDailyChartConfigs(sortedConfigs);
                setNumOfDailyCharts(savedConfigs.length);
                lastSavedDailyChartConfigsRef.current = JSON.parse(JSON.stringify(sortedConfigs));
            }
        }).catch((error) => {
            console.error('Error fetching daily chart configs:', error);
        });
        GetChartConfigs(userData?.user?.email, ChartType.HOURLY).then((savedConfigs) => {
            if (savedConfigs && savedConfigs.length > 0) {
                const sortedConfigs = sortChartConfigsByIndex(savedConfigs);
                setHourlyChartConfigs(sortedConfigs);
                setNumOfHourlyCharts(savedConfigs.length);
                lastSavedHourlyChartConfigsRef.current = JSON.parse(JSON.stringify(sortedConfigs));
            }
        }).catch((error) => {
            console.error('Error fetching hourly chart configs:', error);
        });
    }, [userData?.user?.email, sortChartConfigsByIndex]);

    // Fetch categories only once when user email changes
    useEffect(() => {
        if(!userData?.user?.email){ return }
        GetCategories(userData?.user?.email).then((categoryList) => {
                  setUserCategories(categoryList!);
                  if (categoryList && categoryList.length > 0) {
                      // Only initialize if chartConfigs is empty (first load)
                      setWeeklyChartConfigs(prevConfigs => {
                          if (prevConfigs.length === 0) {
                              return Array.from({ length: numOfWeeklyCharts }, (_, i) => ({
                                  index: i,
                                  selectedCategory: categoryList[i]?.name || categoryList[0].name,
                                  sumType: "total" as const,
                                  type: "bar" as const
                              }));
                          }
                          return prevConfigs;
                      });
                      setDailyChartConfigs(prevConfigs => {
                          if (prevConfigs.length === 0) {
                              return Array.from({ length: numOfDailyCharts }, (_, i) => ({
                                  index: i,
                                  selectedCategory: categoryList[i]?.name || categoryList[0].name,
                                  sumType: "total" as const,
                                  type: "bar" as const
                              }));
                          }
                          return prevConfigs;
                      });
                      setHourlyChartConfigs(prevConfigs => {
                          if (prevConfigs.length === 0) {
                              return Array.from({ length: numOfHourlyCharts }, (_, i) => ({
                                  index: i,
                                  selectedCategory: categoryList[i]?.name || categoryList[0].name,
                                  sumType: "total" as const,
                                  type: "bar" as const
                              }));
                          }
                          return prevConfigs;
                      });
                  }
                });
    }, [userData?.user?.email, numOfWeeklyCharts, numOfDailyCharts, numOfHourlyCharts]);

    // Fetch days when user email changes (not on date change - we filter client-side)
    useEffect(() => {
        if(!userData?.user?.email){ return }
        GetDays(userData?.user?.email).then((daysList) => {
            setDayEntries(daysList!);
        });
    }, [userData?.user?.email]);

    const weekEntries = useMemo(() => {
        const entries = createWeekEntries(dayEntries, selectedDate);
        return sortWeekEntriesByTime(entries) || [];
    }, [dayEntries, selectedDate, createWeekEntries, sortWeekEntriesByTime]);


    const dayOfWeekEntries = useMemo(() => {
        return createDayOfWeekEntries(dayEntries, selectedDate) || [];
    }, [dayEntries, selectedDate, createDayOfWeekEntries]);

    const totalTimeEntriesHours = useMemo(() => {
        return getTotalTimeEntriesHours(dayOfWeekEntries);
    }, [dayOfWeekEntries, getTotalTimeEntriesHours]);

    const getPieChartValuePercentage = useCallback((value: number) => {
        if (totalTimeEntriesHours === 0) return '0%';
        return `${(value / totalTimeEntriesHours * 100).toFixed(1)}%`;
    }, [totalTimeEntriesHours]);

    const getPieChartArcLabel = useCallback((params: DefaultizedPieValueType) => {
        if (totalTimeEntriesHours === 0) return '0 hours (0%)';
        return `${params.value} (${getPieChartValuePercentage(params.value)})`;
    }, [totalTimeEntriesHours, getPieChartValuePercentage]);

    const pieChartData = useMemo(() => {
        return createPieChartData(dayOfWeekEntries);
    }, [dayOfWeekEntries, createPieChartData]);

    const pieChartValueFormatter = useCallback((value: any) => {
        return `${value.value} hours (${getPieChartValuePercentage(value.value)})`;
    }, [getPieChartValuePercentage]);

    const pieChartSeries = useMemo(() => [{
        data: pieChartData,
        innerRadius: 100, 
        outerRadius: 225, 
        highlightScope: { highlight: 'item' as const },
        valueFormatter: pieChartValueFormatter,
        arcLabel: getPieChartArcLabel,
        arcLabelMinAngle: 25,
    }] as const, [pieChartData, pieChartValueFormatter, getPieChartArcLabel]);

    const hourlyEntries = useMemo(() => {
        return createHourlyEntries(dayEntries, selectedDate) || [];
    }, [dayEntries, selectedDate, createHourlyEntries]);

    const handleCategoryChange = (index: number, value: string, chartType: ChartType) => {
        if (chartType === ChartType.WEEKLY) {
            const newChartConfigs = [...weeklyChartConfigs];
            newChartConfigs[index] = { ...newChartConfigs[index], selectedCategory: value };
            setWeeklyChartConfigs(newChartConfigs);
        } else if (chartType === ChartType.DAILY) {
            const newChartConfigs = [...dailyChartConfigs];
            newChartConfigs[index] = { ...newChartConfigs[index], selectedCategory: value };
            setDailyChartConfigs(newChartConfigs);
        } else if (chartType === ChartType.HOURLY) {
            const newChartConfigs = [...hourlyChartConfigs];
            newChartConfigs[index] = { ...newChartConfigs[index], selectedCategory: value };
            setHourlyChartConfigs(newChartConfigs);
        }
    }

    const toggleChartSumType = (index: number, chartType: ChartType) => {
        if (chartType === ChartType.WEEKLY) {
            const newChartConfigs = [...weeklyChartConfigs];
            newChartConfigs[index] = { 
                ...newChartConfigs[index], 
                sumType: newChartConfigs[index].sumType === "total" ? "average" : "total" 
            };
            setWeeklyChartConfigs(newChartConfigs);
        } else if (chartType === ChartType.DAILY) {
            const newChartConfigs = [...dailyChartConfigs];
            newChartConfigs[index] = { 
                ...newChartConfigs[index],
                sumType: newChartConfigs[index].sumType === "total" ? "average" : "total"
            };
            setDailyChartConfigs(newChartConfigs);
        } else if (chartType === ChartType.HOURLY) {
            const newChartConfigs = [...hourlyChartConfigs];
            newChartConfigs[index] = { 
                ...newChartConfigs[index],
                sumType: newChartConfigs[index].sumType === "total" ? "average" : "total"
            };
            setHourlyChartConfigs(newChartConfigs);
        }
    }

    const toggleChartType = (index: number, chartType: ChartType) => {
        if (chartType === ChartType.WEEKLY) {
            const newChartConfigs = [...weeklyChartConfigs];
            newChartConfigs[index] = { 
                ...newChartConfigs[index], 
                type: newChartConfigs[index].type === "bar" ? "line" : "bar" 
            };
            setWeeklyChartConfigs(newChartConfigs);
        } else if (chartType === ChartType.DAILY) {
            const newChartConfigs = [...dailyChartConfigs];
            newChartConfigs[index] = { 
                ...newChartConfigs[index], 
                type: newChartConfigs[index].type === "bar" ? "line" : "bar" 
            };
            setDailyChartConfigs(newChartConfigs);
        } else if (chartType === ChartType.HOURLY) {
            const newChartConfigs = [...hourlyChartConfigs];
            newChartConfigs[index] = { 
                ...newChartConfigs[index],
                type: newChartConfigs[index].type === "bar" ? "line" : "bar"
            };
            setHourlyChartConfigs(newChartConfigs);
        }
    }

    const incrementNumOfCharts = (chartType: ChartType) => {
        if (chartType === ChartType.WEEKLY) {
            setNumOfWeeklyCharts(prev => prev + 1);
            setWeeklyChartConfigs(prevConfigs => {
                const nextIndex = prevConfigs.length;
                const defaultCategory = userCategories[nextIndex]?.name || userCategories[0]?.name || '';
                return [...prevConfigs, {
                    index: nextIndex,
                    selectedCategory: defaultCategory,
                    sumType: "total" as const,
                    type: "bar" as const
                }];
            });
        } else if (chartType === ChartType.DAILY) {
            setNumOfDailyCharts(prev => prev + 1);
            setDailyChartConfigs(prevConfigs => {
                const nextIndex = prevConfigs.length;
                const defaultCategory = userCategories[nextIndex]?.name || userCategories[0]?.name || '';
                return [...prevConfigs, {
                    index: nextIndex,
                    selectedCategory: defaultCategory,
                    sumType: "total" as const,
                    type: "bar" as const
                }];
            });
        } else if (chartType === ChartType.HOURLY) {
            setNumOfHourlyCharts(prev => prev + 1);
            setHourlyChartConfigs(prevConfigs => {
                const nextIndex = prevConfigs.length;
                const defaultCategory = userCategories[nextIndex]?.name || userCategories[0]?.name || '';
                return [...prevConfigs, {
                    index: nextIndex,
                    selectedCategory: defaultCategory,
                    sumType: "total" as const,
                    type: "bar" as const
                }];
            });
        }
    }

    const decrementNumOfCharts = (chartType: ChartType) => {
        if (chartType === ChartType.WEEKLY) {
            if (numOfWeeklyCharts <= 1) { return }    
            setNumOfWeeklyCharts(prev => prev - 1);
            setWeeklyChartConfigs(prevConfigs => {
                const newConfigs = [...prevConfigs];
                newConfigs.pop();
                return newConfigs;
            });
        } else if (chartType === ChartType.DAILY) {
            if (numOfDailyCharts <= 1) { return }    
            setNumOfDailyCharts(prev => prev - 1);
            setDailyChartConfigs(prevConfigs => {
                const newConfigs = [...prevConfigs];
                newConfigs.pop();
                return newConfigs;
            });
        } else if (chartType === ChartType.HOURLY) {
            if (numOfHourlyCharts <= 1) { return }    
            setNumOfHourlyCharts(prev => prev - 1);
            setHourlyChartConfigs(prevConfigs => {
                const newConfigs = [...prevConfigs];
                newConfigs.pop();
                return newConfigs;
            });
        }
    }

    const handleRemoveChart = (index: number, chartType: ChartType) => {
        if (chartType === ChartType.WEEKLY) {
            if (numOfWeeklyCharts <= 1) { return }
            const newChartConfigs = [...weeklyChartConfigs];
            newChartConfigs.splice(index, 1);
            setWeeklyChartConfigs(newChartConfigs);
            setNumOfWeeklyCharts(prev => prev - 1);
        } else if (chartType === ChartType.DAILY) {
            if (numOfDailyCharts <= 1) { return }
            const newChartConfigs = [...dailyChartConfigs];
            newChartConfigs.splice(index, 1);
            setDailyChartConfigs(newChartConfigs);
            setNumOfDailyCharts(prev => prev - 1);
        } else if (chartType === ChartType.HOURLY) {    
            if (numOfHourlyCharts <= 1) { return }
            const newChartConfigs = [...hourlyChartConfigs];
            newChartConfigs.splice(index, 1);
            setHourlyChartConfigs(newChartConfigs);
            setNumOfHourlyCharts(prev => prev - 1);
        }
    }

  return (
    <div>
        <PageContainer slots={{ header: CustomPageHeaderComponent }} sx={{ minHeight: 'calc(100vh - 128px)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                <Card sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: 'var(--mui-spacing)', 
                    margin: 'var(--mui-spacing) 0',
                    maxWidth: '500px' 
                }}>
                    <Typography variant="h6">Activity Breakdown</Typography>
                    <PieChart
                        series={pieChartSeries}
                        height={450}
                        width={450}
                        hideLegend={true}
                        sx={{
                            [`& .MuiPieArcLabel-root`]: {
                                fontWeight: 'bold'
                            },
                            }}
                    />
                </Card>
            </div>


            <ChartsGrid    
                title="Weekly Charts"
                chartType={ChartType.WEEKLY}
                numOfCharts={numOfWeeklyCharts}
                chartConfigs={weeklyChartConfigs}
                isEditing={isEditing}
                entries={weekEntries}
                userCategories={userCategories}
                onCategoryChange={(index, value) => handleCategoryChange(index, value, ChartType.WEEKLY)}
                onToggleChartSumType={(index) => toggleChartSumType(index, ChartType.WEEKLY)}
                onToggleChartType={(index) => toggleChartType(index, ChartType.WEEKLY)}
                createBarChartData={createWeekEntriesBarChartData}
                toggleIsEditing={toggleIsEditing}
                handleRemoveChart={(index) => handleRemoveChart(index, ChartType.WEEKLY)}
                incrementNumOfCharts={() => incrementNumOfCharts(ChartType.WEEKLY)}
            />
            <ChartsGrid    
                title="Daily Charts"
                chartType={ChartType.DAILY}
                numOfCharts={numOfDailyCharts}
                chartConfigs={dailyChartConfigs}
                isEditing={isEditing}
                entries={dayOfWeekEntries}
                userCategories={userCategories}
                onCategoryChange={(index, value) => handleCategoryChange(index, value, ChartType.DAILY)}
                onToggleChartSumType={(index) => toggleChartSumType(index, ChartType.DAILY)}
                onToggleChartType={(index) => toggleChartType(index, ChartType.DAILY)}
                createBarChartData={createDayOfWeekEntriesBarChartData}
                toggleIsEditing={toggleIsEditing}
                handleRemoveChart={(index) => handleRemoveChart(index, ChartType.DAILY)}
                incrementNumOfCharts={() => incrementNumOfCharts(ChartType.DAILY)}
            />
            <ChartsGrid    
                title="Hourly Charts"
                chartType={ChartType.HOURLY}
                numOfCharts={numOfHourlyCharts}
                chartConfigs={hourlyChartConfigs}
                isEditing={isEditing}
                entries={hourlyEntries}
                userCategories={userCategories}
                onCategoryChange={(index, value) => handleCategoryChange(index, value, ChartType.HOURLY)}
                onToggleChartSumType={(index) => toggleChartSumType(index, ChartType.HOURLY)}
                onToggleChartType={(index) => toggleChartType(index, ChartType.HOURLY)}
                createBarChartData={createHourlyEntriesBarChartData}
                toggleIsEditing={toggleIsEditing}
                handleRemoveChart={(index) => handleRemoveChart(index, ChartType.HOURLY)}
                incrementNumOfCharts={() => incrementNumOfCharts(ChartType.HOURLY)}
            />
        </PageContainer>
        { isEditing && 
        <Box sx={{ position: 'sticky', bottom: 0, left: 0, right: 0, scrollbarGutter: "auto", backgroundColor: 'primary.contrastText'}}>
            <div style={{ 
                display: "flex", 
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "calc( var(--mui-spacing) * 2)",
                borderTop: "1px solid #e0e0e0",
                paddingTop: "var(--mui-spacing)",
                paddingBottom: "var(--mui-spacing)",
                paddingLeft: "calc( var(--mui-spacing) * 2)",
                paddingRight: "calc( var(--mui-spacing) * 2)"
            }}>
                <Button variant="contained" size='large' type='submit' id="submit-button" onClick={toggleIsEditing}>Done</Button>
            </div>
        </Box>
        }
    </div>
    );
}