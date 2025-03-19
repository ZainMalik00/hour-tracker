import { db } from "../firebase";
import { collection, query, where, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const UserService = {
    addUser: async function(user){
        await addDoc(collection(db, "users"), user);
    },

    addUserData: async function(userData){
        const docRef = await addDoc(collection(db, "usersData"), userData);
        return docRef.id
    },

    removeUser: async function (username){
        await deleteDoc(doc(db, "users", username));
    },

    getUserIdByEmail: async function(email){
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

    getUserDataIdByUserID: async function(userID: string){
        const userQuery = query(collection(db, "usersData"), where("userID", "==", userID));
        const docRef = await getDocs(userQuery);
        let foundUsers = [];

        docRef.forEach((doc: any) => {
            if(doc){
                foundUsers = foundUsers.concat(doc.id);
            }
        });

        return foundUsers;
    },

};

export default UserService;