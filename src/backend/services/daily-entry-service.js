import { db } from "../firebase.js";
import {updateDoc, getDoc, arrayUnion, doc, arrayRemove } from "firebase/firestore";

const DailyEntryService = {
    addDayEntry: async function(userID, dayEntry){
        const ref = doc(db, "users", userID);

        await updateDoc(ref, {
            daily: arrayUnion(dayEntry)
        });
    },

    removeDayEntry: async function (userID, dayEntry){
        const ref = doc(db, "users", userID);
        
        await updateDoc(ref, {
            daily: arrayRemove(dayEntry)
        });
    },

    getDays: async function (userID){
        const docRef = await getDoc(doc(db, "users", userID));
        
        return docRef.data().daily;
    },

    // getDay: async function (userID, dateIndex){
    //     const docRef = await getDoc(doc(db, "users", userID));
        
    //     return docRef.data().daily[dateIndex];
    // }
};

export default DailyEntryService;