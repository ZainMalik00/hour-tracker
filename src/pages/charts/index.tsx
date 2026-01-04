import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { PageContainer, PageHeader, PageHeaderToolbar } from '@toolpad/core/PageContainer';
import { useSession } from 'next-auth/react';
import { TimeEntry } from '../../components/hour-entry-form/hour-entry-form';
import { GetDays } from '../../backend/user-stories/daily/get-daily-entries/get-daily-entries';
import { Box, Button, Card, Grid, IconButton } from '@mui/material';
import { GetCategories } from '../../backend/user-stories/categories/get-categories/get-categories';
import { DefaultCategories } from '../../backend/entities/DefaultCategories';
import { GetChartConfigs } from '../../backend/user-stories/charts/get-chart-configs.ts/get-chart-configs';
import { UpdateChartConfigs } from '../../backend/user-stories/charts/update-chart-configs/update-chart-configs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ChartCard from '../../components/chart-card/chart-card';
import { ChartConfig } from '../../backend/entities/ChartConfig';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
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
    const [ numOfCharts, setNumOfCharts ] = useState(4);
    const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([]);
    const [selectedDate, setSelectedDate] = useState(dayjs().year());
    const [isEditing, setIsEditing] = useState(false);
    const lastSavedChartConfigsRef = useRef<ChartConfig[]>([]);

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
        if (userData?.user?.email) {
            if (areChartConfigsEqual(chartConfigs, lastSavedChartConfigsRef.current)) { return; }

            try {
                await UpdateChartConfigs(userData.user.email, chartConfigs);
                lastSavedChartConfigsRef.current = JSON.parse(JSON.stringify(chartConfigs));
            } catch (error) {
                console.error('Error updating chart configs:', error);
            }
        }
    }, [userData?.user?.email, chartConfigs, areChartConfigsEqual]);

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

    const sortWeekEntriesByTime = useCallback((weekEntries: WeekEntry[]) => {
        if(weekEntries.length == 1) { return weekEntries }
        return [...weekEntries].sort((a, b) => a.week - b.week)
    }, []);

    const getTotalTimeEntriesHoursByCategory = useCallback((category: string, weekEntry: WeekEntry): number => {
        if (!weekEntry.timeEntries) { return 0; }
        const allTimeEntries = weekEntry.timeEntries.flat();
        return allTimeEntries.filter((timeEntry: TimeEntry) => timeEntry.category === category).length / 2;
    }, []);

    const getAverageTimeEntriesHoursByCategory = useCallback((category: string, weekEntry: WeekEntry): number => {
        if (!weekEntry.timeEntries) { return 0; }
        const allTimeEntries = weekEntry.timeEntries.flat();
        return allTimeEntries.filter((timeEntry: TimeEntry) => timeEntry.category === category).length / 14; // 7 days in a week, half hour intervals
    }, []);

    const createBarChartData = useCallback((category: string, type: "total" | "average", weekEntries: any[]): { xData: number[]; yData: number[] } => {
        const xData: number[] = [];
        const yData: number[] = [];
        weekEntries.forEach((weekEntry) => {
            xData.push(weekEntry.week);
            yData.push(type === "total" ? getTotalTimeEntriesHoursByCategory(category, weekEntry) : getAverageTimeEntriesHoursByCategory(category, weekEntry));
        })
        return { xData, yData };
    }, [getTotalTimeEntriesHoursByCategory, getAverageTimeEntriesHoursByCategory]);
    
    const sortChartConfigsByIndex = useCallback((chartConfigs: ChartConfig[]) => {
        return [...chartConfigs].sort((a, b) => (a.index || 0) - (b.index || 0));
    }, []);

    // Fetch chartConfigs when user email changes
    useEffect(() => {
        if(!userData?.user?.email){ return }
        GetChartConfigs(userData?.user?.email).then((savedConfigs) => {
            if (savedConfigs && savedConfigs.length > 0) {
                const sortedConfigs = sortChartConfigsByIndex(savedConfigs);
                setChartConfigs(sortedConfigs);
                setNumOfCharts(savedConfigs.length);
                lastSavedChartConfigsRef.current = JSON.parse(JSON.stringify(sortedConfigs));
            }
        }).catch((error) => {
            console.error('Error fetching chart configs:', error);
        });
    }, [userData?.user?.email, sortChartConfigsByIndex]);

    // Fetch categories only once when user email changes
    useEffect(() => {
        if(!userData?.user?.email){ return }
        GetCategories(userData?.user?.email).then((categoryList) => {
                  setUserCategories(categoryList!);
                  if (categoryList && categoryList.length > 0) {
                      // Only initialize if chartConfigs is empty (first load)
                      setChartConfigs(prevConfigs => {
                          if (prevConfigs.length === 0) {
                              return Array.from({ length: numOfCharts }, (_, i) => ({
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
    }, [userData?.user?.email]);

    // Fetch days when user email changes (not on date change - we filter client-side)
    useEffect(() => {
        if(!userData?.user?.email){ return }
        GetDays(userData?.user?.email).then((daysList) => {
            setDayEntries(daysList!);
        });
    }, [userData?.user?.email]);

    const weekEntries = useMemo(() => {
        const entries = createWeekEntries(dayEntries, selectedDate);
        return sortWeekEntriesByTime(entries);
    }, [dayEntries, selectedDate, createWeekEntries, sortWeekEntriesByTime]);

    const handleCategoryChange = (index: number, value: string) => {
        const newChartConfigs = [...chartConfigs];
        newChartConfigs[index] = { ...newChartConfigs[index], selectedCategory: value };
        setChartConfigs(newChartConfigs);
    }

    const toggleChartSumType = (index: number) => {
        const newChartConfigs = [...chartConfigs];
        newChartConfigs[index] = { 
            ...newChartConfigs[index], 
            sumType: newChartConfigs[index].sumType === "total" ? "average" : "total" 
        };
        setChartConfigs(newChartConfigs);
    }

    const toggleChartType = (index: number) => {
        const newChartConfigs = [...chartConfigs];
        newChartConfigs[index] = { 
            ...newChartConfigs[index], 
            type: newChartConfigs[index].type === "bar" ? "line" : "bar" 
        };
        setChartConfigs(newChartConfigs);
    }

    const incrementNumOfCharts = () => {
        setNumOfCharts(prev => prev + 1);
        setChartConfigs(prevConfigs => {
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

    const decrementNumOfCharts = () => {
        if (numOfCharts <= 1) { return }    
            setNumOfCharts(prev => prev - 1);
            setChartConfigs(prevConfigs => {
                const newConfigs = [...prevConfigs];
                newConfigs.pop();
                return newConfigs;
            });

    }

    const handleRemoveChart = (index: number) => {
        if (numOfCharts <= 1) { return }
        const newChartConfigs = [...chartConfigs];
        newChartConfigs.splice(index, 1);
        setChartConfigs(newChartConfigs);
        setNumOfCharts(prev => prev - 1);
    }

  return (
    <div>
        <PageContainer slots={{ header: CustomPageHeaderComponent }} sx={{ minHeight: 'calc(100vh - 128px)' }}>
            <Grid container size="grow" 
                rowSpacing={{ xs: 2, sm: 2, md: 3 }} 
                columnSpacing={{ xs: 2, sm: 2, md: 3 }}
                sx={{
                    display: "flex",
                    justifyContent: "center"
                }}
            >
                {Array.from({ length: numOfCharts }, (_, i) => {
                    const chartConfig = chartConfigs[i] || {
                        selectedCategory: userCategories[i]?.name || userCategories[0]?.name || '',
                        chartSumType: "total" as const,
                        chartType: "bar" as const
                    };
                    return (
                        <ChartCard
                            key={i}
                            index={i}
                            isEditing={isEditing}
                            chartConfig={chartConfig}
                            weekEntries={weekEntries}
                            userCategories={userCategories}
                            onCategoryChange={handleCategoryChange}
                            onToggleChartSumType={toggleChartSumType}
                            onToggleChartType={toggleChartType}
                            createBarChartData={createBarChartData}
                            toggleIsEditing={toggleIsEditing}
                            handleRemoveChart={handleRemoveChart}   
                        />
                    );
                })}
                { isEditing && <Card sx={{ height: '385px' }}>
                    <Button
                        onClick={incrementNumOfCharts} 
                        size='large'
                        variant='outlined' 
                        sx={{ 
                            boxSizing: 'border-box', 
                            minWidth: "460px", 
                            maxWidth: "600px", 
                            height: '345px', 
                            border: '3px solid', 
                            margin: '20px' 
                        }}
                    ><AddCircleOutlineIcon sx={{transform: "scale(2)"}} /></Button>
                </Card> }
            </Grid>
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