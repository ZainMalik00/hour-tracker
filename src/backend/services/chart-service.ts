import { ChartConfig } from "../entities/ChartConfig";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export enum ChartType {
    WEEKLY = "weekly",
    DAILY = "daily",
    HOURLY = "hourly"
}

const ChartService = {
    updateChartConfigs: async function(userID: string, chartConfigs: ChartConfig[], chartType: ChartType){
        const ref = doc(db, "users", userID);
        const fieldName = chartType === ChartType.WEEKLY ? "chartConfigsWeekly" : chartType === ChartType.DAILY ? "chartConfigsDaily" : "chartConfigsHourly";   
        await updateDoc(ref, {
            [fieldName]: chartConfigs
        });
    },

    getChartConfigs: async function(userID: string, chartType: ChartType){
        const docRef: any = await getDoc(doc(db, "users", userID));
        const userData = docRef.data();
        const fieldName = chartType === ChartType.WEEKLY ? "chartConfigsWeekly" : chartType === ChartType.DAILY ? "chartConfigsDaily" : "chartConfigsHourly";
        return userData ? userData[fieldName] : null;
    }
 }
export default ChartService;