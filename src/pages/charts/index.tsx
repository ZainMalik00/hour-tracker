import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { PageContainer, PageHeader, PageHeaderToolbar } from '@toolpad/core/PageContainer';
import { useSession } from 'next-auth/react';
import { TimeEntry } from '../../components/hour-entry-form/hour-entry-form';
import { GetDays } from '../../backend/user-stories/daily/get-daily-entries/get-daily-entries';
import { Box, Button } from '@mui/material';
import { GetCategories } from '../../backend/user-stories/categories/get-categories/get-categories';
import { DefaultCategories } from '../../backend/entities/DefaultCategories';
import { GetChartConfigs } from '../../backend/user-stories/charts/get-chart-configs.ts/get-chart-configs';
import { UpdateChartConfigs } from '../../backend/user-stories/charts/update-chart-configs/update-chart-configs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ChartConfig } from '../../backend/entities/ChartConfig';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import ChartsPageContainer from '../../components/page-containers/charts-page-container/charts-page-container';

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
    const [userCategories, setUserCategories] = useState(DefaultCategories);
    const [dayEntries, setDayEntries] = useState<DayEntry[]>([]);
    const [ numOfAnnualCharts, setNumOfAnnualCharts ] = useState(4);
    const [ numOfWeeklyCharts, setNumOfWeeklyCharts ] = useState(4);
    const [annualChartConfigs, setAnnualChartConfigs] = useState<ChartConfig[]>([]);
    const [weeklyChartConfigs, setWeeklyChartConfigs] = useState<ChartConfig[]>([]);
    const [selectedDate, setSelectedDate] = useState(dayjs().year());
    const [isEditing, setIsEditing] = useState(false);
    const lastSavedAnnualChartConfigsRef = useRef<ChartConfig[]>([]);
    const lastSavedWeeklyChartConfigsRef = useRef<ChartConfig[]>([]);

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

        const isWeeklyConfigsEqual = areChartConfigsEqual(weeklyChartConfigs, lastSavedWeeklyChartConfigsRef.current);
        const isAnnualConfigsEqual = areChartConfigsEqual(annualChartConfigs, lastSavedAnnualChartConfigsRef.current);
        if (isWeeklyConfigsEqual && isAnnualConfigsEqual) { return; }

        try {
            if(!isWeeklyConfigsEqual) {
                await UpdateChartConfigs(userData.user.email, weeklyChartConfigs, "weekly");
                lastSavedWeeklyChartConfigsRef.current = JSON.parse(JSON.stringify(weeklyChartConfigs));
            }
            if(!isAnnualConfigsEqual) {
                await UpdateChartConfigs(userData.user.email, annualChartConfigs, "annual");
                lastSavedAnnualChartConfigsRef.current = JSON.parse(JSON.stringify(annualChartConfigs));
            }
        } catch (error) {
            console.error('Error updating chart configs:', error);
        }
    }, [userData?.user?.email, annualChartConfigs, weeklyChartConfigs, areChartConfigsEqual]);

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
                    combinedMap[entryDayOfWeek].timeEntries = [...dayEntry.timeEntries];
                } else {
                    combinedMap[entryDayOfWeek].timeEntries = [...existingEntries, ...dayEntry.timeEntries];
                }
            }
        });
        
        return Object.values(combinedMap) as DayOfWeekEntry[];
    }, [dayEntries]);

    const sortWeekEntriesByTime = useCallback((weekEntries: WeekEntry[]) => {
        if(weekEntries.length == 1) { return weekEntries }
        return [...weekEntries].sort((a, b) => a.week - b.week)
    }, []);

    const getTotalTimeEntriesHoursByCategory = useCallback((category: string, entry: WeekEntry | DayOfWeekEntry): number => {
        if (!entry.timeEntries) { return 0; }
        const allTimeEntries = entry.timeEntries.flat();
        return allTimeEntries.filter((timeEntry: TimeEntry) => timeEntry.category === category).length / 2;
    }, []);

    const getAverageTimeEntriesHoursByCategory = useCallback((category: string, entry: WeekEntry | DayOfWeekEntry): number => {
        if (!entry.timeEntries) { return 0; }
        const allTimeEntries = entry.timeEntries.flat();
        return allTimeEntries.filter((timeEntry: TimeEntry) => timeEntry.category === category).length / 14; // 7 days in a week, half hour intervals
    }, []);

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
            yData.push(type === "total" ? getTotalTimeEntriesHoursByCategory(category, weekEntry) : getAverageTimeEntriesHoursByCategory(category, weekEntry));
        })
        return { xData, yData };
    }, [getTotalTimeEntriesHoursByCategory, getAverageTimeEntriesHoursByCategory]);
    
    const createDayOfWeekEntriesBarChartData = useCallback((category: string, type: "total" | "average", dayOfWeekEntries: DayOfWeekEntry[]): { xData: (number | string)[]; yData: number[] } => {
        const xData: (number | string)[] = [];
        const yData: number[] = [];
        if (!dayOfWeekEntries || !Array.isArray(dayOfWeekEntries)) { return { xData, yData }; }
        dayOfWeekEntries.forEach((dayOfWeekEntry) => {
            xData.push(convertDayOfWeekToDayOfWeekName(dayOfWeekEntry.dayOfWeek as number));
            yData.push(type === "total" ? getTotalTimeEntriesHoursByCategory(category, dayOfWeekEntry) : getAverageTimeEntriesHoursByCategory(category, dayOfWeekEntry));
        })
        return { xData, yData };
    }, [getTotalTimeEntriesHoursByCategory, getAverageTimeEntriesHoursByCategory, convertDayOfWeekToDayOfWeekName]);    

    const sortChartConfigsByIndex = useCallback((chartConfigs: ChartConfig[]) => {
        return [...chartConfigs].sort((a, b) => (a.index || 0) - (b.index || 0));
    }, []);

    // Fetch chartConfigs when user email changes
    useEffect(() => {
        if(!userData?.user?.email){ return }
        
        GetChartConfigs(userData?.user?.email, "annual").then((savedConfigs) => {
            if (savedConfigs && savedConfigs.length > 0) {
                const sortedConfigs = sortChartConfigsByIndex(savedConfigs);
                setAnnualChartConfigs(sortedConfigs);
                setNumOfAnnualCharts(savedConfigs.length);
                lastSavedAnnualChartConfigsRef.current = JSON.parse(JSON.stringify(sortedConfigs));
            }
        }).catch((error) => {
            console.error('Error fetching annual chart configs:', error);
        });
        
        GetChartConfigs(userData?.user?.email, "weekly").then((savedConfigs) => {
            if (savedConfigs && savedConfigs.length > 0) {
                const sortedConfigs = sortChartConfigsByIndex(savedConfigs);
                setWeeklyChartConfigs(sortedConfigs);
                setNumOfWeeklyCharts(savedConfigs.length);
                lastSavedWeeklyChartConfigsRef.current = JSON.parse(JSON.stringify(sortedConfigs));
            }
        }).catch((error) => {
            console.error('Error fetching weekly chart configs:', error);
        });
    }, [userData?.user?.email, sortChartConfigsByIndex]);

    // Fetch categories only once when user email changes
    useEffect(() => {
        if(!userData?.user?.email){ return }
        GetCategories(userData?.user?.email).then((categoryList) => {
                  setUserCategories(categoryList!);
                  if (categoryList && categoryList.length > 0) {
                      // Only initialize if chartConfigs is empty (first load)
                      setAnnualChartConfigs(prevConfigs => {
                          if (prevConfigs.length === 0) {
                              return Array.from({ length: numOfAnnualCharts }, (_, i) => ({
                                  index: i,
                                  selectedCategory: categoryList[i]?.name || categoryList[0].name,
                                  sumType: "total" as const,
                                  type: "bar" as const
                              }));
                          }
                          return prevConfigs;
                      });
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
                  }
                });
    }, [userData?.user?.email, numOfAnnualCharts, numOfWeeklyCharts]);

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

    const handleCategoryChange = (index: number, value: string, chartType: "annual" | "weekly") => {
        if (chartType === "annual") {
            const newChartConfigs = [...annualChartConfigs];
            newChartConfigs[index] = { ...newChartConfigs[index], selectedCategory: value };
            setAnnualChartConfigs(newChartConfigs);
        } else {
            const newChartConfigs = [...weeklyChartConfigs];
            newChartConfigs[index] = { ...newChartConfigs[index], selectedCategory: value };
            setWeeklyChartConfigs(newChartConfigs);
        }
    }

    const toggleChartSumType = (index: number, chartType: "annual" | "weekly") => {
        if (chartType === "annual") {
            const newChartConfigs = [...annualChartConfigs];
            newChartConfigs[index] = { 
                ...newChartConfigs[index], 
                sumType: newChartConfigs[index].sumType === "total" ? "average" : "total" 
            };
            setAnnualChartConfigs(newChartConfigs);
        } else {
            const newChartConfigs = [...weeklyChartConfigs];
            newChartConfigs[index] = { 
                ...newChartConfigs[index], 
                sumType: newChartConfigs[index].sumType === "total" ? "average" : "total" 
            };
            setWeeklyChartConfigs(newChartConfigs);
        }
    }

    const toggleChartType = (index: number, chartType: "annual" | "weekly") => {
        if (chartType === "annual") {
            const newChartConfigs = [...annualChartConfigs];
            newChartConfigs[index] = { 
                ...newChartConfigs[index], 
                type: newChartConfigs[index].type === "bar" ? "line" : "bar" 
            };
            setAnnualChartConfigs(newChartConfigs);
        } else {
            const newChartConfigs = [...weeklyChartConfigs];
            newChartConfigs[index] = { 
                ...newChartConfigs[index], 
                type: newChartConfigs[index].type === "bar" ? "line" : "bar" 
            };
            setWeeklyChartConfigs(newChartConfigs);
        }
    }

    const incrementNumOfCharts = (chartType: "annual" | "weekly") => {
        if (chartType === "annual") {
            setNumOfAnnualCharts(prev => prev + 1);
            setAnnualChartConfigs(prevConfigs => {
                const nextIndex = prevConfigs.length;
                const defaultCategory = userCategories[nextIndex]?.name || userCategories[0]?.name || '';
                return [...prevConfigs, {
                    index: nextIndex,
                    selectedCategory: defaultCategory,
                    sumType: "total" as const,
                    type: "bar" as const
                }];
            });
        } else {
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
        }
    }

    const decrementNumOfCharts = (chartType: "annual" | "weekly") => {
        if (chartType === "annual") {
            if (numOfAnnualCharts <= 1) { return }    
            setNumOfAnnualCharts(prev => prev - 1);
            setAnnualChartConfigs(prevConfigs => {
                const newConfigs = [...prevConfigs];
                newConfigs.pop();
                return newConfigs;
            });
        } else {
            if (numOfWeeklyCharts <= 1) { return }    
            setNumOfWeeklyCharts(prev => prev - 1);
            setWeeklyChartConfigs(prevConfigs => {
                const newConfigs = [...prevConfigs];
                newConfigs.pop();
                return newConfigs;
            });
        }
    }

    const handleRemoveChart = (index: number, chartType: "annual" | "weekly") => {
        if (chartType === "annual") {
            if (numOfAnnualCharts <= 1) { return }
            const newChartConfigs = [...annualChartConfigs];
            newChartConfigs.splice(index, 1);
            setAnnualChartConfigs(newChartConfigs);
            setNumOfAnnualCharts(prev => prev - 1);
        } else {
            if (numOfWeeklyCharts <= 1) { return }
            const newChartConfigs = [...weeklyChartConfigs];
            newChartConfigs.splice(index, 1);
            setWeeklyChartConfigs(newChartConfigs);
            setNumOfWeeklyCharts(prev => prev - 1);
        }
    }

  return (
    <div>
        <PageContainer slots={{ header: CustomPageHeaderComponent }} sx={{ minHeight: 'calc(100vh - 128px)' }}>
            <ChartsPageContainer    
                title="Annual Charts"
                numOfCharts={numOfAnnualCharts}
                chartConfigs={annualChartConfigs}
                isEditing={isEditing}
                entries={weekEntries}
                userCategories={userCategories}
                onCategoryChange={(index, value) => handleCategoryChange(index, value, "annual")}
                onToggleChartSumType={(index) => toggleChartSumType(index, "annual")}
                onToggleChartType={(index) => toggleChartType(index, "annual")}
                createBarChartData={createWeekEntriesBarChartData}
                toggleIsEditing={toggleIsEditing}
                handleRemoveChart={(index) => handleRemoveChart(index, "annual")}
                incrementNumOfCharts={() => incrementNumOfCharts("annual")}
            />
            <ChartsPageContainer    
                title="Weekly Charts"
                numOfCharts={numOfWeeklyCharts}
                chartConfigs={weeklyChartConfigs}
                isEditing={isEditing}
                entries={dayOfWeekEntries}
                userCategories={userCategories}
                onCategoryChange={(index, value) => handleCategoryChange(index, value, "weekly")}
                onToggleChartSumType={(index) => toggleChartSumType(index, "weekly")}
                onToggleChartType={(index) => toggleChartType(index, "weekly")}
                createBarChartData={createDayOfWeekEntriesBarChartData}
                toggleIsEditing={toggleIsEditing}
                handleRemoveChart={(index) => handleRemoveChart(index, "weekly")}
                incrementNumOfCharts={() => incrementNumOfCharts("weekly")}
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