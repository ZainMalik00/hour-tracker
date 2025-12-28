import { db } from "../firebase";
import {collection, updateDoc, getDoc, arrayUnion, addDoc, doc, arrayRemove, query, where, getDocs } from "firebase/firestore";

const DailyEntryService = {
    addDayEntry: async function(userID: string, dayEntry){
        const docRef = await addDoc(collection(db, "days"), dayEntry);
        const ref = doc(db, "users", userID);
        await updateDoc(ref, {
            days: arrayUnion(docRef.id)
        });
    },

    removeDayEntry: async function (userID: string, dayEntry){
        const ref = doc(db, "users", userID);
        await updateDoc(ref, {
            days: arrayRemove(dayEntry)
        });
    },

    addTimeEntry: async function name(userID: string, date: string, timeEntry) {
        const dayQuery = await query(collection(db, "days"), where("userID", "==", userID), where("date","==", date))
        const docRef = await getDocs(dayQuery);
        docRef.forEach(async (docSnap: any) => {
            if(docSnap){
                const ref = doc(db, "days", docSnap.id);
                await updateDoc(ref, {
                    timeEntries: arrayUnion(timeEntry)
                });
            }
        }) 
    },

    getDays: async function (userID: string){
        const dayQuery = query(collection(db, "days"), where("userID", "==", userID));
        const docRef = await getDocs(dayQuery);
        let foundDayEntries = [];

        docRef.forEach((doc: any) => {
            if(doc){
                foundDayEntries = foundDayEntries.concat(doc.id);
            }
        });

        if(foundDayEntries.length == 0){ return null; }
        return foundDayEntries
    },

    getDayEntry: async function (userID: string, date: string) {
        const userQuery = query(collection(db, "days"), where("userID", "==", userID), where("date","==", date));
        const docRef = await getDocs(userQuery);
        let foundDayEntries = [];

        docRef.forEach((doc: any) => {
            if(doc){
                let dayEntry = doc.data()
                dayEntry["id"] = doc.id
                foundDayEntries = foundDayEntries.concat(dayEntry);
            }
        });

        if(foundDayEntries.length == 0){ return null; }
        return foundDayEntries[0]
    },

    getDayEntryTimes: async function (userID: string, date: string) {
        const userQuery = query(collection(db, "days"), where("userID", "==", userID), where("date","==", date));
        const docRef = await getDocs(userQuery);
        let foundDayEntries = [];

        docRef.forEach((doc: any) => {
            if(doc){
                foundDayEntries = foundDayEntries.concat(doc.data().timeEntries);
            }
        });

        if(foundDayEntries.length == 0){ return null; }
        return foundDayEntries
    },

    updateDayEntryTimes: async function (dayEntryID: string, timeEntries: string[]) {
        const userRef = doc(db, "days", dayEntryID);
        await updateDoc(userRef, {
            "timeEntries": timeEntries
        });
    }

};

export default DailyEntryService;