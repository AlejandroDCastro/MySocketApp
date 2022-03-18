import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ user }) => {
    return (
        <div id="header">
            <h1>
                <Link to={'/'} onClick={() => { user.chatting = false }}>MySocket</Link>
            </h1>
        </div>
    )
}

export default Header;
