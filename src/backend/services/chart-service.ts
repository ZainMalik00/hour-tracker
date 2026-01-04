import { ChartConfig } from "../entities/ChartConfig";
import { db } from "../firebase";
import { collection, query, where, addDoc, getDocs, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";

const ChartService = {
    updateChartConfigs: async function(userID: string, chartConfigs: ChartConfig[]){
        const ref = doc(db, "users", userID);
        await updateDoc(ref, {
            chartConfigs: chartConfigs
        });
    },

    getChartConfigs: async function(userID: string){
        const docRef: any = await getDoc(doc(db, "users", userID));
        const userData = docRef.data();
        return userData ? userData.chartConfigs : null;
    }
 }
export default ChartService;