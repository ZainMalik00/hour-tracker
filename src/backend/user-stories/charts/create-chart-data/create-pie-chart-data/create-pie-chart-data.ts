import { PieChartData } from "../../../../entities/ChartConfig";
import { CategoryEntry } from "../../../../entities/DefaultCategories";
import { DayOfWeekEntry, HourlyEntry } from "../../../../entities/Entries";

export const CreatePieChartData = (entries: DayOfWeekEntry[] | HourlyEntry[], userCategories: CategoryEntry[] ): PieChartData[] => {
    const data: PieChartData[] = [];
    if (!entries || !Array.isArray(entries)) { return []; }
    
    const allTimeEntries = entries.flatMap((entry) => entry.timeEntries || []);
    
    userCategories.forEach((categoryEntry) => {
        const count = allTimeEntries.filter((timeEntry) => timeEntry && (typeof timeEntry.category === 'number' ? timeEntry.category : Number(timeEntry.category)) === Number(categoryEntry.id)).length;
        data.push({ 
            id: Number(categoryEntry.id), 
            value: count / 2, 
            label: categoryEntry.name, 
            color: categoryEntry.color 
        });
    })   
    return data;
};