import React from 'react';
import Header from './header/Header';
import Navbar from './navbar/Navbar';
import './Head.css';

const Head = () => {
    return (
        <div id="head" className="background-purple">
            <Header />
            <Navbar />
        </div>
    )
}

export default Head;
