import { db } from "../firebase.js";
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

    getCategories: async function (userID){
        const docRef = await getDoc(doc(db, "users", userID));
        return docRef.data().categories;
    }
};

export default CategoryService;