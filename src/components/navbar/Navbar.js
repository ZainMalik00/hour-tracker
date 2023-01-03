import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { auth, provider } from '../../backend/firebase.js'
import { signInWithPopup, signOut } from 'firebase/auth';

import './Navbar.css';
import '../../index.css';

function Navbar() {
    const [isAuth, setIsAuth] = useState(false);
    const [username, setUsername] = useState("Login");
    
    useEffect(() => {
        const name = localStorage.getItem('name');
        const authExists = localStorage.getItem('isAuth');
        
        if(name) {
            setUsername(name);
        }

        if(authExists){
            setIsAuth(authExists);
        }

      }, []);

    const signInWithGoogle = () => {
        signInWithPopup(auth, provider).then((result) => {
            localStorage.setItem("isAuth", true);
            localStorage.setItem("name", result.user.displayName);
            setIsAuth(true);
            setUsername(result.user.displayName);
            
        },
        (error) => {
            setUsername("Login");
        }); 
    };

    const signOutUser = () => {
        if (window.confirm("Are You Sure You Want To Sign Out?")) {
            signOut(auth).then(() => {
                localStorage.clear();
                setIsAuth(false);
                setUsername("Login");
            }, (error) => {});
        }
    };

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
                        <a className="nav-item nav-link" href="#" onClick={isAuth ? signOutUser : signInWithGoogle}>{username}</a>
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