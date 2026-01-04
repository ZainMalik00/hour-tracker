import { ChartConfig } from "./ChartConfig";
import { CategoryEntry } from "./DefaultCategories";
import { Day } from "./Day";

export interface User {
    name: string;
    email: string;
    password?: string;
    categories: CategoryEntry[];
    days: Day[];
    chartConfigs?: ChartConfig[];
}
