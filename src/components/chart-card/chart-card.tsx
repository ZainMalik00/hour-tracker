import React, { useMemo } from 'react';
import { Card, IconButton, ListItemText, MenuItem, Select, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts';
import CloseIcon from '@mui/icons-material/Close';
import styles from './chart-card.module.css';
import { ChartConfig } from '../../backend/entities/ChartConfig';
import { DayOfWeekEntry, WeekEntry } from '../page-containers/charts-page-container/charts-page-container';

export interface ChartCardProps {
  index: number;
  chartConfig: ChartConfig;
  entries: WeekEntry[] | DayOfWeekEntry[];
  userCategories: any[];
  isEditing: boolean;
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
  handleRemoveChart,
  toggleIsEditing, 
  onCategoryChange, 
  onToggleChartSumType, 
  onToggleChartType,
  createBarChartData 
}: ChartCardProps) => {
  const categoryBarChartData = useMemo(() => 
    createBarChartData(chartConfig.selectedCategory, chartConfig.sumType, entries),
    [chartConfig.selectedCategory, chartConfig.sumType, entries, createBarChartData]
  );
  const selectedCategoryColor = userCategories.find((category) => category.name === chartConfig.selectedCategory)?.color || 'primary.main';
  const chartSumTypeText = chartConfig.sumType === "total" ? "Total" : "Average";
  const chartTypeText = chartConfig.type === "bar" ? "Bar Chart" : "Line Chart";


  const handleRemoveChartClick = () => {
    handleRemoveChart(index);
  }

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
        
          <ToggleButtonGroup
            orientation="vertical"
            value={chartConfig.sumType}
            exclusive
            onChange={() => onToggleChartSumType(index)}
          >
            <ToggleButton value="avg" aria-label="Select Chart Type" sx={{ maxHeight: '40px', color: 'primary.main' }}>
              <Typography variant="body1" textAlign="center">{chartSumTypeText === "Total" ? "Average" : "Total"}</Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
        <IconButton onClick={handleRemoveChartClick}>
          <CloseIcon />
        </IconButton>
      </div> }
      <Typography variant="h6" textAlign="center" className={styles.title}>
        {chartSumTypeText} {chartConfig.selectedCategory} Hours by Week
      </Typography>
      { chartTypeText === "Bar Chart" && 
        <BarChart
          key={index}
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
          key={index}
          xAxis={[{ label: "Weeks", data: categoryBarChartData.xData, scaleType: 'band'}]}
          yAxis={[{ label: "Hours" }]}
          series={[{ 
            label: chartConfig.selectedCategory, 
            data: categoryBarChartData.yData, 
            color: selectedCategoryColor, 
            showMark: false, 
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
