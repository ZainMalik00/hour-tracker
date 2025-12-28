import { db } from "../firebase";
import {updateDoc, getDoc, arrayUnion, doc, arrayRemove } from "firebase/firestore";

const CategoryService = {
    addCategory: async function(userID, category){
        const ref = doc(db, "users", userID);
        await updateDoc(ref, {
            categories: arrayUnion(category)
        });
    },

    removeCategory: async function (userID, category){
        const ref = doc(db, "users", userID);
        await updateDoc(ref, {
            categories: arrayRemove(category)
        });
    },

    getCategories: async function (userID: string){
        const docRef: any = await getDoc(doc(db, "users", userID));
        const userData = docRef.data();
        return userData ? userData.categories : null;
    }
};

export default CategoryService;