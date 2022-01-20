import React from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import './Header.css';

const Header = () => {
    return (
        <div id="header">
            <h1>
                <Link to={'/'}>MySocket</Link>
            </h1>
        </div>
    )
}

export default Header;
