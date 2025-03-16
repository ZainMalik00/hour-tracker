import { db } from "../firebase.ts";
import { collection, query, where, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const UserService = {
    addUser: async function(user){
        await addDoc(collection(db, "users"), user);
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
    }

};

export default UserService;