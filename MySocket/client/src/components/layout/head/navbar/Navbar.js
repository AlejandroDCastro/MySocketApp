import React, { useContext } from 'react';
import { UserContext } from '../../../../UserContext';
import SignedInMenu from './SignedInMenu';
import SignedOutMenu from './SignedOutMenu';
import ChatMenu from './ChatMenu';
import './Navbar.css';

const Navbar = () => {
    const { user, setUser } = useContext(UserContext);

    const logout = async () => {
        try {
            const res = await fetch('https://localhost:5000/logout', {
                credentials: 'include'
            });
            const data = await res.json();
            if (data.logout) {
                setUser(null);
                localStorage.removeItem('privateKey');

                // Set the current view for user
                sessionStorage.removeItem('privateRoom');
                sessionStorage.removeItem('sharedRoom');
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleFirstTransition = e => {
        document.getElementById('btn-menu').dataset.dissapear = 'false';
    }


    // Choose the menu to show
    const menu = (user) ? ((user.chatting) ? <ChatMenu user={user} logout={logout} /> : <SignedInMenu logout={logout} />) : <SignedOutMenu />;


    return (
        <>
            <input onClick={handleFirstTransition} data-dissapear="true" id="btn-menu" type="checkbox" />
            <div id="set-mobile">
                <label htmlFor="btn-menu"><i className="fas fa-bars letter-blue"></i></label>
            </div>
            <nav id="navbar">
                <ul>
                    {menu}
                </ul>
            </nav>
            <span id="nav-background"></span>
        </>
    )
}

export default Navbar;
