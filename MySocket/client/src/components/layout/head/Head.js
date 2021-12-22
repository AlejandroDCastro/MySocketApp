import React, { useContext } from 'react';
import Header from './header/Header';
import Navbar from './navbar/Navbar';
import { UserContext } from '../../../UserContext';
import './Head.css';

const Head = () => {
    const { user, setUser } = useContext(UserContext);

    return (
        <div id="head" className="background-purple">
            <p>{(user) ? `Welcome ${user.name}!` : ''}</p>
            <Header />
            <Navbar />
        </div>
    )
}

export default Head;
