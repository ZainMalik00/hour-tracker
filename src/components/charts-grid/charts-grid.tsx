import React from 'react';
import { Typography, Grid, Card, Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ChartCard from '../chart-card/chart-card';
import { ChartConfig } from '../../backend/entities/ChartConfig';
import styles from './charts-grid.module.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ChartType } from '../../backend/services/chart-service';
import { HourlyEntry } from '../../pages/charts';

export interface WeekEntry {
  week: number;
  timeEntries: any[] | null;
}

export interface DayOfWeekEntry {
  dayOfWeek: number;
  timeEntries: any[] | null;
}

export interface ChartsGridProps {
  numOfCharts: number;
  chartConfigs: ChartConfig[];
  isEditing: boolean;
  entries: WeekEntry[] | DayOfWeekEntry[] | HourlyEntry[];
  userCategories: any[];
  title: string;
  chartType: ChartType;
  onCategoryChange: (index: number, value: string) => void;
  onToggleChartSumType: (index: number) => void;
  onToggleChartType: (index: number) => void;
  createBarChartData: (category: string, type: "total" | "average", weekEntries: any[]) => { xData: (number | string)[]; yData: number[] };
  toggleIsEditing: () => void;
  handleRemoveChart: (index: number) => void;
  incrementNumOfCharts: () => void;
}

const ChartsGrid = ({
  numOfCharts,
  chartConfigs,
  isEditing,
  entries,
  userCategories,
  title,
  chartType,
  onCategoryChange,
  onToggleChartSumType,
  onToggleChartType,
  createBarChartData,
  toggleIsEditing,
  handleRemoveChart,
  incrementNumOfCharts
}: ChartsGridProps) => {
  return (
    <div>
      <Accordion defaultExpanded className={styles.accordionContainer}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
          className={styles.accordionSummary}
        >
          <Typography variant="h5" className={styles.title}>{title}</Typography>
        </AccordionSummary>
        <AccordionDetails className={styles.accordionDetails}>
          <Grid 
            container 
            size="grow" 
            rowSpacing={{ xs: 2, sm: 2, md: 3 }} 
            columnSpacing={{ xs: 2, sm: 2, md: 3 }}
            className={styles.grid}
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
                  chartType={chartType}
                  chartConfig={chartConfig}
                  entries={entries}
                  userCategories={userCategories}
                  onCategoryChange={onCategoryChange}
                  onToggleChartSumType={onToggleChartSumType}
                  onToggleChartType={onToggleChartType}
                  createBarChartData={createBarChartData}
                  toggleIsEditing={toggleIsEditing}
                  handleRemoveChart={handleRemoveChart}   
                />
              );
            })}
            { isEditing && <Card className={styles.addCard}>
              <Button
                onClick={incrementNumOfCharts} 
                size='large'
                variant='outlined' 
                className={styles.addButton}
              >
                <AddCircleOutlineIcon className={styles.addIcon} />
              </Button>
            </Card> }
          </Grid>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default ChartsGrid;
