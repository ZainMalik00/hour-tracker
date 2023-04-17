import { db } from "../firebase.js";
import {updateDoc, getDoc, arrayUnion, doc, arrayRemove } from "firebase/firestore";

const AnnualCategoryEntryService = {
    addAnnualCategoryEntry: async function(userID, annualCategoryEntry){
        const ref = doc(db, "users", userID);

        await updateDoc(ref, {
            daily: arrayUnion(annualCategoryEntry)
        });
    },

    removeAnnualCategoryEntry: async function (userID, annualCategoryEntry){
        const ref = doc(db, "users", userID);
        
        await updateDoc(ref, {
            daily: arrayRemove(annualCategoryEntry)
        });
    },

    getAnnualCategoryEntries: async function (userID){
        const docRef = await getDoc(doc(db, "users", userID));
        
        return docRef.data().categoriesByHour;
    },

    // getDay: async function (userID, dateIndex){
    //     const docRef = await getDoc(doc(db, "users", userID));
        
    //     return docRef.data().daily[dateIndex];
    // }
};

export default AnnualCategoryEntryService;