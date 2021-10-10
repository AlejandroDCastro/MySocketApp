import React from 'react';
import './Navbar.css';

const SignedInMenu = ({ logout }) => {
    return (
        <li onClick={logout}><a href="#" className="letter-blue">Logout</a></li>
    )
}

export default SignedInMenu;
