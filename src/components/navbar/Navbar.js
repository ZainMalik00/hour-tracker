import React, { useState, useEffect } from 'react';
import './Navbar.css';
import '../../index.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { auth, provider } from '../../backend/firebase.js'
import { signInWithPopup, signOut } from 'firebase/auth';
import UserService from '../../backend/services/user-service.js';
import { User } from '../../backend/entities/User';
import { DefaultCategories } from '../../backend/entities/DefaultCategories';

function Navbar() {
    const [isAuth, setIsAuth] = useState(false);
    const [userData, setUserData] = useState(["Login"]);

    useEffect(() => {
        const name = localStorage.getItem('name');
        const email = localStorage.getItem('email');
        const authExists = localStorage.getItem('isAuth');
        
        if(name) {
            setUserData([name, email]);
        }

        if(authExists){
            setIsAuth(authExists);
        }

      }, []);

    const signInWithGoogle = () => {
        signInWithPopup(auth, provider).then((result) => {
            localStorage.setItem("isAuth", true);
            localStorage.setItem("name", result.user.displayName);
            localStorage.setItem("email", result.user.email);
            setIsAuth(true);
            setUserData([result.user.displayName, result.user.email]);
            addUser(result.user.displayName, result.user.email, "");
        },
        (error) => {
            setUserData(["Login"]);
        }); 
    };

    const signOutUser = () => {
        if (window.confirm("Are You Sure You Want To Sign Out?")) {
            signOut(auth).then(() => {
                localStorage.clear();
                setIsAuth(false);
                setUserData(["Login"]);
            }, (error) => {});
        }
    };

    const addUser = async (name, email, password) => {
        const newUser = User(
            name,
            email,
            password,
            DefaultCategories,
        );

        const existingUser = await UserService.getUserByEmail(newUser.email);

        if(existingUser.length == 0){
            UserService.addUser(newUser);
        }
    }

    return(
        <Router>
            <nav className="navbar navbar-expand-lg px-2" id="customNav">
                <a className="navbar-brand" href="#">HOUR TRACKER</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMarkup" aria-controls="navbarMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarMarkup">
                    <div className="navbar-nav">
                        <a className="nav-item nav-link active" href="#">Home</a>
                        <a className="nav-item nav-link" href="#">Insert</a>
                        <a className="nav-item nav-link" href="#">Charts</a>
                        <a className="nav-item nav-link" href="#">Analytics</a>
                        <a className="nav-item nav-link" href="#" onClick={isAuth ? signOutUser : signInWithGoogle}>{userData[0]}</a>
                    </div>
                </div>
            </nav>
            <Routes>
                {/* <Route path="/login" element={<span onClick={signInWithGoogle} />} /> */}
            </Routes>
        </Router>
    );
};

export default Navbar;