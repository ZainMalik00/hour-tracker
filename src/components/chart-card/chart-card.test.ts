import React from 'react';
import ReactDOM from 'react-dom';
import ChartCard, { ChartConfig } from './chart-card';

const mockChartConfig: ChartConfig = {
  selectedCategory: 'Test Category',
  chartSumType: 'total',
  chartType: 'bar'
};

const mockWeekEntries: any[] = [
  { week: 1, timeEntries: null },
  { week: 2, timeEntries: null }
];

const mockUserCategories: any[] = [
  { name: 'Test Category', color: 'primary.main' }
];

const mockCreateBarChartData = jest.fn(() => ({
  xData: [1, 2],
  yData: [10, 20]
}));

const mockOnCategoryChange = jest.fn();
const mockOnToggleChartSumType = jest.fn();
const mockOnToggleChartType = jest.fn();

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <ChartCard
      index={0}
      chartConfig={mockChartConfig}
      weekEntries={mockWeekEntries}
      userCategories={mockUserCategories}
      onCategoryChange={mockOnCategoryChange}
      onToggleChartSumType={mockOnToggleChartSumType}
      onToggleChartType={mockOnToggleChartType}
      createBarChartData={mockCreateBarChartData}
    />,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
