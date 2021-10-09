import React from 'react';
import './Navbar.css';

const Navbar = () => {
    const handleFirstTransition = isTransition => {
        
        document.getElementById('btn-menu').dataset.dissapear = 'false';
    }

    return (
        <>
            <input onClick={handleFirstTransition} data-dissapear="true" id="btn-menu" type="checkbox" />
            <div id="set-mobile">
                <label htmlFor="btn-menu"><i className="fas fa-bars letter-blue"></i></label>
            </div>
            <nav id="navbar">
                <ul>
                    <li><a href="/login" className="letter-blue">Login</a></li>
                    <li><a href="/signup" className="letter-blue">Signup</a></li>
                    <li><a href="#" className="letter-blue">Logout</a></li>
                </ul>
            </nav>
            <span id="nav-background"></span>
        </>
    )
}

export default Navbar;
