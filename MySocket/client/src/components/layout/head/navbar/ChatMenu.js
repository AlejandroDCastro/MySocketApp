import React from 'react';
import { Link } from 'react-router-dom';

const ChatMenu = ({ user, logout }) => {
    return (
        <>
            <li><Link onClick={() => { user.chatting = false }} to={'/'} className="letter-blue">Home</Link></li>
            <li onClick={logout}><a href="#" className="letter-blue">Logout</a></li>
        </>
    )
}

export default ChatMenu;