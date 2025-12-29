import { db } from "../firebase";
import { collection, query, where, addDoc, getDocs, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { DefaultCategories } from "../entities/DefaultCategories";

const UserService = {
    addUser: async function(user){
        await addDoc(collection(db, "users"), user);
    },

    removeUser: async function (username){
        await deleteDoc(doc(db, "users", username));
    },

    getUserIdByEmail: async function(email){
        if (!email) { return []; }
        const userQuery = query(collection(db, "users"), where("email", "==", email));
        const docRef = await getDocs(userQuery);
        let foundUsers = [];

        docRef.forEach((doc: any) => {
            if(doc){
                foundUsers = foundUsers.concat(doc.id);
            }
        });

        return foundUsers;
    },

    getUserByEmail: async function(email){
        if (!email) { return []; }
        const userQuery = query(collection(db, "users"), where("email", "==", email));
        const docRef = await getDocs(userQuery);
        let foundUsers = [];

        docRef.forEach((doc: any) => {
            if(doc){
                foundUsers = foundUsers.concat(doc.data());
            }
        });

        return foundUsers;
    },

    getUserById: async function(userID: string){
        const userRef = doc(db, "users", userID);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data();
        }
        return null;
    },

    initializeUserData: async function(userID: string){
        const userRef = doc(db, "users", userID);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            return false;
        }

        const userData = userSnap.data();
        
        // Initialize categories if they don't exist
        if (!userData.categories || userData.categories.length === 0) {
            await updateDoc(userRef, {
                categories: DefaultCategories,
                days: userData.days || []
            });
        }
        
        return true;
    },

};

export default UserService;