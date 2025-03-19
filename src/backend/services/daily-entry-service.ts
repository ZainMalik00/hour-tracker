import { db } from "../firebase";
import {collection, updateDoc, getDoc, arrayUnion, addDoc, doc, arrayRemove } from "firebase/firestore";

const DailyEntryService = {
    addDayEntry: async function(userDataID, dayEntry){
        const docRef = await addDoc(collection(db, "days"), dayEntry);
        const ref = doc(db, "usersData", userDataID);

        await updateDoc(ref, {
            days: arrayUnion(docRef.id)
        });
    },

    removeDayEntry: async function (userDataID, dayEntry){
        const ref = doc(db, "users", userDataID);
        
        await updateDoc(ref, {
            daily: arrayRemove(dayEntry)
        });
    },

    getDays: async function (userID){
        const docRef: any = await getDoc(doc(db, "users", userID));
        
        return docRef.data().daily;
    },

    // getDay: async function (userID, dateIndex){
    //     const docRef = await getDoc(doc(db, "users", userID));
        
    //     return docRef.data().daily[dateIndex];
    // }
};

export default DailyEntryService;