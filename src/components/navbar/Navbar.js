import React, { useState, useEffect } from 'react';
import './Navbar.css';
import '../../index.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { auth, provider } from '../../backend/firebase.js'
import { signInWithPopup, signOut } from 'firebase/auth';
import { AddUser } from '../../backend/user-stories/users/add-user/add-user';
import { AddCategory } from '../../backend/user-stories/categories/add-category/add-category';
import { RemoveCategory } from '../../backend/user-stories/categories/remove-category/remove-category';
import { UpdateCategory } from '../../backend/user-stories/categories/update-category/update-category';
import { Day } from '../../backend/entities/Day.js';
import { AddDayEntry } from '../../backend/user-stories/daily/add-daily-entry/add-daily-entry';
import { RemoveDayEntry } from '../../backend/user-stories/daily/remove-daily-entry/remove-daily-entry';
import { UpdateDayEntry } from '../../backend/user-stories/daily/update-daily-entry/update-daily-entry';
import { AddAnnualCategoryEntry } from '../../backend/user-stories/annually/add-annual-entry/add-annual-entry';
import { CategoriesByHour } from '../../backend/entities/CategoriesByHour';
import { RemoveAnnualCategoryEntry } from '../../backend/user-stories/annually/remove-annual-entry/remove-annual-entry';
import { UpdateAnnualCategoryEntry } from '../../backend/user-stories/annually/update-annual-entry/update-annual-entry';


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
            AddUser(result.user.displayName, result.user.email, "");
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

    // const deleteUser = () => {
    //     RemoveUser(userData[1]).then(() => {
    //         signOut(auth).then(() => {
    //             localStorage.clear();
    //             setIsAuth(false);
    //             setUserData(["Login"]);
    //         }, (error) => {});
    //     });
    // };

    // const addCategory = () => {
    //     AddCategory(userData[1], "NEW"); 
    // };

    // const removeCategory = () => {
    //     RemoveCategory(userData[1], "NEW");
    // };

    // const updateCategory = () => {
    //     UpdateCategory(userData[1], "NEW", "NEW2");
    // };

    // const addDay = () => {
    //     const newDay = Day(
    //         "JAN 1",
    //         1,
    //         "DayOfWeek 1",
    //         "NEW CATEGORY",
    //     );
    //     AddDayEntry(userData[1], newDay);
    // }

    // const removeDay = () => {
    //     const oldDay = Day(
    //         "JAN 1",
    //         1,
    //         "DayOfWeek 1",
    //         "NEW CATEGORY",
    //     );
    //     RemoveDayEntry(userData[1], oldDay);
    // };

    // const updateDay = () => {
    //     const oldDay = Day(
    //         "JAN 1",
    //         1,
    //         "DayOfWeek 1",
    //         "NEW CATEGORY",
    //     );
        
    //     const newDay = Day(
    //         "JAN 2",
    //         1,
    //         "DayOfWeek 1",
    //         "NEW CATEGORY2",
    //     );

    //     UpdateDayEntry(userData[1], oldDay, newDay);
    // }

    // const addAnnumEntry = () => {
    //     const newAnnumEntry = CategoriesByHour(
    //         "SLEEPING",
    //         1,
    //     );
    //     AddAnnualCategoryEntry(userData[1], newAnnumEntry);
    // }

    // const removeAnnumEntry = () => {
    //     const oldAnnumEntry = CategoriesByHour(
    //         "SLEEPING",
    //         1,
    //     );
    //     RemoveAnnualCategoryEntry(userData[1], oldAnnumEntry);
    // };
    
    // const updateAnnumEntry = () => {
    //     const newAnnumEntry = CategoriesByHour(
    //         "SLEEPING",
    //         21,
    //     );
        
    //     const oldAnnumEntry = CategoriesByHour(
    //         "SLEEPING",
    //         1,
    //     );

    //     UpdateAnnualCategoryEntry(userData[1], oldAnnumEntry, newAnnumEntry);
    // }

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
                        {/* <a className="nav-item nav-link" href="#" onClick={deleteUser}>Delete User</a> 
                        <a className="nav-item nav-link" href="#" onClick={addCategory}>Add Category</a>
                        <a className="nav-item nav-link" href="#" onClick={removeCategory}>Remove Category</a>
                        <a className="nav-item nav-link" href="#" onClick={updateCategory}>Update Category</a>
                        <a className="nav-item nav-link" href="#" onClick={addDay}>Add Entry</a>
                        <a className="nav-item nav-link" href="#" onClick={removeDay}>Remove Entry</a>
                        <a className="nav-item nav-link" href="#" onClick={updateDay}>Update Entry</a> 
                        <a className="nav-item nav-link" href="#" onClick={addAnnumEntry}>Add Annum Entry</a>
                        <a className="nav-item nav-link" href="#" onClick={removeAnnumEntry}>Remove Annum Entry</a>
                        <a className="nav-item nav-link" href="#" onClick={updateAnnumEntry}>Update Annum Entry</a> */}
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