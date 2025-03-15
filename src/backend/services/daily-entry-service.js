import { db } from "../firebase.js";
import {collection, updateDoc, getDoc, arrayUnion, addDoc, doc, arrayRemove } from "firebase/firestore";

const DailyEntryService = {
    addDayEntry: async function(userID, dayEntry){
        const docRef = await addDoc(collection(db, "days"), dayEntry);
        const ref = doc(db, "users", userID);

        await updateDoc(ref, {
            days: arrayUnion(docRef.id)
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