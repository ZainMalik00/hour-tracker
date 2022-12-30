import React from 'react';
import './Navbar.css';
import '../../index.css';

class Navbar extends React.Component {

    render(){
        return(
            <nav className="navbar navbar-expand-lg navbar-light bg-success px-2">
                <a className="navbar-brand" href="#">HOUR TRACKER</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMarkup" aria-controls="navbarMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarMarkup">
                    <div class="navbar-nav">
                        <a class="nav-item nav-link active" href="#">Home</a>
                        <a class="nav-item nav-link" href="#">Insert</a>
                        <a class="nav-item nav-link" href="#">Charts</a>
                        <a class="nav-item nav-link" href="#">Analytics</a>
                    </div>
                </div>
            </nav>
        );
    }
}

export default Navbar;