import { ChartConfig } from "../entities/ChartConfig";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export type ChartType = "annual" | "weekly";

const ChartService = {
    updateChartConfigs: async function(userID: string, chartConfigs: ChartConfig[], chartType: ChartType){
        const ref = doc(db, "users", userID);
        const fieldName = chartType === "annual" ? "chartConfigsAnnual" : "chartConfigsWeekly";
        await updateDoc(ref, {
            [fieldName]: chartConfigs
        });
    },

    getChartConfigs: async function(userID: string, chartType: ChartType){
        const docRef: any = await getDoc(doc(db, "users", userID));
        const userData = docRef.data();
        const fieldName = chartType === "annual" ? "chartConfigsAnnual" : "chartConfigsWeekly";
        return userData ? userData[fieldName] : null;
    }
 }
export default ChartService;