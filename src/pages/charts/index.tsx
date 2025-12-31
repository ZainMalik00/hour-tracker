import React, { useCallback, useEffect, useState } from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { BarChart, barClasses, barElementClasses } from '@mui/x-charts/BarChart';
import { useSession } from 'next-auth/react';
import { TimeEntry } from '../../components/hour-entry-form/hour-entry-form';
import { GetDays } from '../../backend/user-stories/daily/get-daily-entries/get-daily-entries';
import Typography from '@mui/material/Typography';
import { Card, Grid, ListItemText, MenuItem, Select, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { GetCategories } from '../../backend/user-stories/categories/get-categories/get-categories';
import { DefaultCategories } from '../../backend/entities/DefaultCategories';
import { LineChart } from '@mui/x-charts';

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

export interface ChartConfig {
  selectedCategory: string;
  chartSumType: "total" | "average";
  chartType: "bar" | "line";
}

// interface BarChartDataEntry {
//   x: number;
//   y: number;
// }

export default function ChartsPage() {
    const { data: userData } = useSession();
    const [userCategories, setUserCategories] = useState(DefaultCategories);
    const [dayEntries, setDayEntries] = useState<DayEntry[]>([]);
    const [weekEntries, setWeekEntries] = useState<any[]>([]);
    const [ numOfCharts, setNumOfCharts ] = useState(4);
    const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([]);

    const getCorrectWeek = (dayEntry: DayEntry) => {
        const month = dayEntry.date.substring(5, 7);
        if(month === "12" && dayEntry.week === 1 ){ return 53; }
        if(month === "12" && dayEntry.week === 2 ){ return 54; }
        return dayEntry.week;
    }

    const createWeekEntries = (dayEntries: DayEntry[]): any[] => {
        // Initialize combinedMap with minimum 52 weeks (always include weeks 1-52)
        const combinedMap: { [key: number]: any } = {};
        for (let week = 1; week <= 52; week++) {
            combinedMap[week] = {
                week: week,
                timeEntries: null
            };
        }
        
        if (!dayEntries || dayEntries.length === 0) { return Object.values(combinedMap); }

        dayEntries.forEach((dayEntry) => {
            const commonWeek = getCorrectWeek(dayEntry);
            dayEntry.week = commonWeek;

            // Process weeks 1-54 (including 53, 54 which are special cases for December)
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

        console.log(Object.values(combinedMap).length);
        return Object.values(combinedMap);

    }

    const sortWeekEntriesByTime = useCallback((weekEntries: WeekEntry[]) => {
        if(weekEntries.length == 1) { return weekEntries }
        return [...weekEntries].sort((a, b) => a.week - b.week)
    }, []);

    const createBarChartData = (category: string, type: "total" | "average", weekEntries: any[]): { xData: number[]; yData: number[] } => {
        const xData: number[] = [];
        const yData: number[] = [];
        weekEntries.forEach((weekEntry) => {
            xData.push(weekEntry.week);
            yData.push(type === "total" ? getTotalTimeEntriesHoursByCategory(category, weekEntry) : getAverageTimeEntriesHoursByCategory(category, weekEntry));
        })
        return { xData, yData };
    }

    const getTotalTimeEntriesHoursByCategory = (category: string, weekEntry: WeekEntry): number => {
        if (!weekEntry.timeEntries) { return 0; }
        const allTimeEntries = weekEntry.timeEntries.flat();
        return allTimeEntries.filter((timeEntry: TimeEntry) => timeEntry.category === category).length / 2;
    }

    const getAverageTimeEntriesHoursByCategory = (category: string, weekEntry: WeekEntry): number => {
        if (!weekEntry.timeEntries) { return 0; }
        const allTimeEntries = weekEntry.timeEntries.flat();
        return allTimeEntries.filter((timeEntry: TimeEntry) => timeEntry.category === category).length / 14; // 7 days in a week, half hour intervals
    }
    
    useEffect(() => {
        if(!userData?.user?.email){ return }
        GetCategories(userData?.user?.email).then((categoryList) => {
                  setUserCategories(categoryList!);
                  if (categoryList && categoryList.length > 0) {
                      setChartConfigs(Array.from({ length: numOfCharts }, (_, i) => ({
                          selectedCategory: categoryList[i]?.name || categoryList[0].name,
                          chartSumType: "total" as const,
                          chartType: "bar" as const
                      })));
                  }
                });
        GetDays(userData?.user?.email).then((daysList) => {
            setDayEntries(daysList!);
            setWeekEntries(sortWeekEntriesByTime(createWeekEntries(daysList!)))
        });
    }, [userData?.user?.email, numOfCharts]);


    const handleCategoryChange = (index: number, value: string) => {
        const newChartConfigs = [...chartConfigs];
        newChartConfigs[index] = { ...newChartConfigs[index], selectedCategory: value };
        setChartConfigs(newChartConfigs);
    }

    const toggleChartSumType = (index: number) => {
        const newChartConfigs = [...chartConfigs];
        newChartConfigs[index] = { 
            ...newChartConfigs[index], 
            chartSumType: newChartConfigs[index].chartSumType === "total" ? "average" : "total" 
        };
        setChartConfigs(newChartConfigs);
    }

    const toggleChartType = (index: number) => {
        const newChartConfigs = [...chartConfigs];
        newChartConfigs[index] = { 
            ...newChartConfigs[index], 
            chartType: newChartConfigs[index].chartType === "bar" ? "line" : "bar" 
        };
        setChartConfigs(newChartConfigs);
    }

  return (
    <PageContainer>
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
                const categoryBarChartData = createBarChartData(chartConfig.selectedCategory, chartConfig.chartSumType, weekEntries);
                const selectedCategoryColor = userCategories.find((category) => category.name === chartConfig.selectedCategory)?.color || 'primary.main';
                const chartSumTypeText = chartConfig.chartSumType === "total" ? "Total" : "Average";
                const chartTypeText = chartConfig.chartType === "bar" ? "Bar Chart" : "Line Chart";
                return (
                    <Card
                    key={i}
                    style={{
                        padding: "10px",
                        minWidth: "400px",
                        maxWidth: "600px",
                        height: "385px"
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: '10px' }}>
                            <div style={{ display: 'flex', gap: 'var(--mui-spacing)' }}>
                                <Select
                                    name="chartType"
                                    key={"chartTypeSelect"+i}
                                    value={chartConfig.chartType}
                                    onChange={() => toggleChartType(i)}
                                    renderValue={(value) => (
                                        <span style={{ 
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        display: 'block',
                                        }}>
                                        {value === "bar" ? "Bar Chart" : "Line Chart"}
                                        </span>
                                    )}
                                    sx={{ 
                                        maxHeight: '40px',
                                        '& .MuiSelect-select': {
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        }
                                    }}
                                >
                                    <MenuItem value="bar">Bar Chart</MenuItem>
                                    <MenuItem value="line">Line Chart</MenuItem>
                                </Select>
                                <Select
                                    name="category"
                                    key={"categorySelect"+i}
                                    value={chartConfig.selectedCategory}
                                    onChange={(event)=> {handleCategoryChange(i, event.target.value)}}
                                    renderValue={(value) => (
                                        <span style={{ 
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        display: 'block',
                                        maxWidth: '120px'
                                        }}>
                                        {value}
                                        </span>
                                    )}
                                    sx={{ 
                                        width: '130%',
                                        maxWidth: '150px',
                                        maxHeight: '40px',
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
                            </div>
                            <ToggleButtonGroup
                                orientation="vertical"
                                value={chartConfig.chartSumType}
                                exclusive
                                onChange={() => toggleChartSumType(i)}
                            >
                                <ToggleButton value="avg" aria-label="Select Chart Type" sx={{ maxHeight: '40px', color: 'primary.main' }}>
                                    <Typography variant="body1" textAlign="center">{chartSumTypeText === "Total" ? "Average" : "Total"}</Typography>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </div>
                        <Typography variant="h6" textAlign="center">{chartSumTypeText} {chartConfig.selectedCategory} Hours by Week</Typography>
                        { chartTypeText === "Bar Chart" && 
                            <BarChart
                                key={i}
                                xAxis={[{ label: "Weeks", data: categoryBarChartData.xData }]}
                                yAxis={[{ label: "Hours" }]}
                                series={[{ label: chartConfig.selectedCategory, data: categoryBarChartData.yData, color: selectedCategoryColor }]}
                                height={300}
                                width={480}
                                hideLegend={true}
                            />
                        }
                        { chartTypeText === "Line Chart" && 
                            <LineChart
                                key={i}
                                xAxis={[{ label: "Weeks", data: categoryBarChartData.xData, scaleType: 'band'}]}
                                yAxis={[{ label: "Hours" }]}
                                series={[{ 
                                    label: chartConfig.selectedCategory, 
                                    data: categoryBarChartData.yData, 
                                    color: selectedCategoryColor, 
                                    showMark: false, 
                                }]}
                                
                                height={300}
                                width={480}
                                hideLegend={true}
                            />
                        }
                    </Card>
                );
            })}
        </Grid>
    </PageContainer>
    );
}