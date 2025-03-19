import { db } from "../firebase";
import {updateDoc, getDoc, arrayUnion, doc, arrayRemove } from "firebase/firestore";

const CategoryService = {
    addCategory: async function(userDataID, category){
        const ref = doc(db, "usersData", userDataID);
        await updateDoc(ref, {
            categories: arrayUnion(category)
        });
    },

    removeCategory: async function (userDataID, category){
        const ref = doc(db, "usersData", userDataID);
        await updateDoc(ref, {
            categories: arrayRemove(category)
        });
    },

    getCategories: async function (userDataID: string){
        const docRef: any = await getDoc(doc(db, "usersData", userDataID));
        return docRef.data().categories;
    }
};

export default CategoryService;