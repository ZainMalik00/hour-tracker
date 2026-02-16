import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { PageContainer, PageHeader, PageHeaderToolbar } from '@toolpad/core/PageContainer';
import { useSession } from 'next-auth/react';
import { TimeEntry } from '../../backend/entities/Entries';
import { GetDays } from '../../backend/user-stories/daily/get-daily-entries/get-daily-entries';
import { Box, Button, Card, Divider, Typography } from '@mui/material';
import { GetCategories } from '../../backend/user-stories/categories/get-categories/get-categories';
import { DefaultCategories } from '../../backend/entities/DefaultCategories';
import { GetChartConfigs } from '../../backend/user-stories/charts/get-chart-configs/get-chart-configs';
import { UpdateChartConfigs } from '../../backend/user-stories/charts/update-chart-configs/update-chart-configs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import { ChartConfig, PieChartData } from '../../backend/entities/ChartConfig';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import ChartsGrid from '../../components/charts-grid/charts-grid';
import { ChartType } from '../../backend/services/chart-service';
import { DefaultizedPieValueType, PieChart } from '@mui/x-charts';
import { CreateWeekEntries } from '../../backend/user-stories/entries/create-week-entries/create-week-entries';
import { DayEntry, WeekEntry, DayOfWeekEntry, HourlyEntry } from '../../backend/entities/Entries';
import { CreateDayOfWeekEntries } from '../../backend/user-stories/entries/create-day-of-week-entries/create-day-of-week-entries';
import { CreateHourlyEntries } from '../../backend/user-stories/entries/create-hourly-entries/create-hourly-entries';
import { CreatePieChartData } from '../../backend/user-stories/charts/create-chart-data/create-pie-chart-data/create-pie-chart-data';
import { CreateDayOfWeekEntriesBarChartData, CreateHourlyEntriesBarChartData, CreateWeekEntriesChartData } from '../../backend/user-stories/charts/create-chart-data/create-week-entries-chart-data/create-week-entries-chart-data';

dayjs.extend(isLeapYear);

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
    const CustomPageToolbarComponent = useCallback(
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

    const handleSelectedDateChange = useCallback((date: dayjs.Dayjs) => { setSelectedDate(date.year()); }, []);

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

    const updateChartConfigs = useCallback(async () => {
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

    const toggleIsEditing = useCallback(async () => {
        if (isEditing) { await updateChartConfigs(); }
        setIsEditing(prev => !prev);
    }, [isEditing, updateChartConfigs]);

    const CustomPageHeaderComponent = useCallback(
        () => <CustomPageHeader status="" selectedDate={dayjs().year(selectedDate)} onSelectedDateChange={handleSelectedDateChange} isEditing={isEditing} toggleIsEditing={toggleIsEditing} />,
        [selectedDate, handleSelectedDateChange, isEditing, toggleIsEditing],
    );

    const createWeekEntries = useCallback((dayEntries: DayEntry[], year: number): any[] => { return CreateWeekEntries(dayEntries, year); }, []);

    const createDayOfWeekEntries = useCallback((dayEntries: DayEntry[], year: number): DayOfWeekEntry[] => { return CreateDayOfWeekEntries(dayEntries, year); }, [dayEntries]);

    const createHourlyEntries = useCallback((dayEntries: DayEntry[], year: number): HourlyEntry[] => { return CreateHourlyEntries(dayEntries, year); }, [dayEntries]);

    const sortWeekEntriesByTime = useCallback((weekEntries: WeekEntry[]) => {
        if(weekEntries.length == 1) { return weekEntries }
        return [...weekEntries].sort((a, b) => a.week - b.week)
    }, []);

    const getTotalTimeEntriesHours = useCallback((entries: DayOfWeekEntry[] | HourlyEntry[]): number => {
        return entries.flatMap((entry) =>  entry.timeEntries).length / 2;
    }, []);

    const createPieChartData = useCallback((entries: DayOfWeekEntry[] | HourlyEntry[]): PieChartData[] => { return CreatePieChartData(entries, userCategories) }, [userCategories]);

    const createWeekEntriesBarChartData = useCallback((category: string, type: "total" | "average", weekEntries: any[]): { xData: number[]; yData: number[] } => {
        return CreateWeekEntriesChartData(category, type, weekEntries, userCategories, selectedDate);
    }, [userCategories, selectedDate]);
    
    const createDayOfWeekEntriesBarChartData = useCallback((category: string, type: "total" | "average", dayOfWeekEntries: DayOfWeekEntry[]): { xData: string[]; yData: number[] } => {
        return CreateDayOfWeekEntriesBarChartData(category, type, dayOfWeekEntries, userCategories, selectedDate);
    }, [userCategories, selectedDate]);    

    const createHourlyEntriesBarChartData = useCallback((category: string, type: "total" | "average", hourlyEntries: any[]): { xData: string[]; yData: number[] } => {
        return CreateHourlyEntriesBarChartData(category, type, hourlyEntries, userCategories);
    }, [userCategories]);

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
            <Divider />
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
            <Divider />
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