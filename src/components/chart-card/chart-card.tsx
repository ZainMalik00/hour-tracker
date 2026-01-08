import React, { useCallback, useMemo } from 'react';
import { Card, IconButton, ListItemText, MenuItem, Select, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts';
import CloseIcon from '@mui/icons-material/Close';
import styles from './chart-card.module.css';
import { ChartConfig } from '../../backend/entities/ChartConfig';
import { DayOfWeekEntry, WeekEntry } from '../charts-grid/charts-grid';
import { ChartType } from '../../backend/services/chart-service';
import { HourlyEntry } from '../../pages/charts';

export interface ChartCardProps {
  index: number;
  chartConfig: ChartConfig;
  entries: WeekEntry[] | DayOfWeekEntry[] | HourlyEntry[];
  userCategories: any[];
  isEditing: boolean;
  chartType: ChartType;
  toggleIsEditing: () => void;
  handleRemoveChart: (index: number) => void;
  onCategoryChange: (index: number, value: string) => void;
  onToggleChartSumType: (index: number) => void;
  onToggleChartType: (index: number) => void;
  createBarChartData: (category: string, type: "total" | "average", weekEntries: any[]) => { xData: (number | string)[]; yData: number[] };
}

const ChartCard = React.memo(({ 
  index, 
  chartConfig, 
  entries, 
  userCategories, 
  isEditing,
  chartType,
  handleRemoveChart,
  toggleIsEditing, 
  onCategoryChange, 
  onToggleChartSumType, 
  onToggleChartType,
  createBarChartData 
}: ChartCardProps) => {
  
  if (entries.length === 0) { return <div></div>; }

  const categoryBarChartData = useMemo(() => 
    createBarChartData(chartConfig.selectedCategory, chartConfig.sumType, entries),
    [chartConfig.selectedCategory, chartConfig.sumType, entries, createBarChartData]
  );

  const selectedCategoryColor = userCategories.find((category) => category.name === chartConfig.selectedCategory)?.color || 'primary.main';
  const chartSumTypeText = chartConfig.sumType === "total" ? "Total" : "Average";
  const chartTypeText = chartConfig.type === "bar" ? "Bar Chart" : "Line Chart";
  const xAxisLabel = chartType === ChartType.DAILY ? "Days" :  chartType === ChartType.WEEKLY ? "Weeks" : "Hours Of Day";  
  const xValueLabel = chartType === ChartType.WEEKLY ? "Week" : ""; 
  
  const convertDayXValueToDayName = useCallback((dayOfWeekString: string) => {
    switch(dayOfWeekString) {
      case "Sun": return "Sunday";
      case "Mon": return "Monday";
      case "Tue": return "Tuesday";
      case "Wed": return "Wednesday";
      case "Thu": return "Thursday";
      case "Fri": return "Friday";
      case "Sat": return "Saturday";
    }
    return dayOfWeekString;
  }, []);

  const handleRemoveChartClick = () => {
    handleRemoveChart(index);
  }

  const determineDecimals = useCallback((value: number) => {
    if (value === 0) { return value.toFixed(0); }
    if (value >= 1) { return value; }
    if (value === 0.5) { return value.toFixed(1); }
    return value.toFixed(3).replace(/\.?0+$/, ""); // remove trailing zeros
  }, []);
  
  const xAxisValueFormatter = useCallback((value: number | string, context: any) => {
        if (context.location === 'tick') { return `${value}`; }
        if (chartType === ChartType.DAILY) { return convertDayXValueToDayName(value as string); }
        return `${xValueLabel} ${value}`;
      }, [xValueLabel, convertDayXValueToDayName]);

  const seriesValueFormatter = useCallback((value: number) => { return `${determineDecimals(value)} hours`; }, [determineDecimals]);

  return (
    <Card className={`${styles.card} ${isEditing ? styles.editing : ''}`}>
      { isEditing && <div className={styles.controlsContainer}>
        <div className={styles.selectsContainer}>
          <Select
            name="chartType"
            key={"chartTypeSelect"+index}
            value={chartConfig.type}
            onChange={() => onToggleChartType(index)}
            renderValue={(value) => (
              <span className={styles.selectValue}>
                {value === "bar" ? "Bar Chart" : "Line Chart"}
              </span>
            )}
            className={styles.chartTypeSelect}
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
            key={"categorySelect"+index}
            value={chartConfig.selectedCategory}
            onChange={(event)=> {onCategoryChange(index, event.target.value)}}
            renderValue={(value) => (
              <span className={styles.selectValue} style={{ maxWidth: '120px' }}>
                {value}
              </span>
            )}
            className={styles.categorySelect}
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
        
          { chartType !== ChartType.HOURLY && <ToggleButtonGroup
            orientation="vertical"
            value={chartConfig.sumType}
            exclusive
            onChange={() => onToggleChartSumType(index)}
          >
            <ToggleButton value="avg" aria-label="Select Chart Type" sx={{ maxHeight: '40px', color: 'primary.main' }}>
              <Typography variant="body1" textAlign="center">{chartSumTypeText === "Total" ? "Average" : "Total"}</Typography>
            </ToggleButton>
          </ToggleButtonGroup>}
        </div>
        <IconButton onClick={handleRemoveChartClick}>
          <CloseIcon />
        </IconButton>
      </div> }
      <Typography variant="h6" textAlign="center" className={styles.title}>
        {chartSumTypeText} {chartConfig.selectedCategory} Hours {chartType === ChartType.HOURLY ? "" : "by"} {chartType === ChartType.HOURLY ? "" : xAxisLabel}
      </Typography>
      { chartTypeText === "Bar Chart" && 
        <BarChart
          key={index}
          xAxis={[{ label: xAxisLabel, data: categoryBarChartData.xData, valueFormatter: xAxisValueFormatter }]}
          yAxis={[{ label: "Hours"}]}
          series={[{ label: chartConfig.selectedCategory, data: categoryBarChartData.yData, color: selectedCategoryColor, valueFormatter: seriesValueFormatter }]}
          grid={{ horizontal: true }}
          height={300}
          width={480}
          hideLegend={true}
        />
      }
      { chartTypeText === "Line Chart" && 
        <LineChart
          key={index}
          xAxis={[{ label: xAxisLabel, data: categoryBarChartData.xData, scaleType: 'band', valueFormatter: xAxisValueFormatter }]}
          yAxis={[{ label: "Hours" }]}
          series={[{ 
            label: chartConfig.selectedCategory, 
            data: categoryBarChartData.yData, 
            color: selectedCategoryColor, 
            showMark: false, 
            valueFormatter: seriesValueFormatter
          }]}
          grid={{ horizontal: true }}
          height={300}
          width={480}
          hideLegend={true}
        />
      }
    </Card>
  );
});

ChartCard.displayName = 'ChartCard';

export default ChartCard;
