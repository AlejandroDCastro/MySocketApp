import React from 'react';
import './Navbar.css';

const SignedOutMenu = () => {
    return (
        <>
            <li><a href="/login" className="letter-blue">Login</a></li>
            <li><a href="/signup" className="letter-blue">Signup</a></li>
        </>
    )
}

export default SignedOutMenu;
