export interface ChartConfig {
  index: number;
  selectedCategory: string;
  sumType: "total" | "average";
  type: "bar" | "line";
}

export interface PieChartData {
  id: number;
  value: number;
  label: string;
  color: string;
}