import { db } from "../firebase.js";
import { collection, query, where, addDoc, getDocs } from "firebase/firestore";

const UserService = {
    //Add User
    addUser: async function(user){
        const docRef = await addDoc(collection(db, "users"), user);
    },

    //Get User By Email
    getUserByEmail: async function(email){
        const q = query(collection(db, "users"), where("email", "==", email));
        const docRef = await getDocs(q);
        let result = [];

        docRef.forEach((doc) => {
            if(doc){
                result = result.concat(doc.data());
            }
        });

        return result;
    }

};

export default UserService;