// WHY DO I NEED THIS?

import { db } from "../firebase";
import {updateDoc, getDoc, arrayUnion, doc, arrayRemove, increment } from "firebase/firestore";

const AnnualCategoryEntryService = {
    addAnnualCategoryEntry: async function(userID, annualCategoryEntry){
        const ref = doc(db, "users", userID);

        await updateDoc(ref, {
            categoriesByHour: arrayUnion(annualCategoryEntry)
        });
    },

    removeAnnualCategoryEntry: async function (userID, annualCategoryEntry){
        const ref = doc(db, "users", userID);
        
        await updateDoc(ref, {
            categoriesByHour: arrayRemove(annualCategoryEntry)
        });
    },

    getAnnualCategoryEntries: async function (userID){
        const docRef: any = await getDoc(doc(db, "users", userID));
        
        return docRef.data().categoriesByHour;
    }
};

export default AnnualCategoryEntryService;