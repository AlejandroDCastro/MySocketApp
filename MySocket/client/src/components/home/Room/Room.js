import React from 'react';
import CryptoJS from 'crypto-js';
import './Room.css';


const Room = ({ name, lastMessage, updatedAt }) => {

    return (
        <>
            <article>
                <h3>{name}</h3>
                <div>
                    <p>{lastMessage}</p>
                    <p><span>Updated: </span>{updatedAt}</p>
                </div>
            </article>
        </>
    )
}

export default Room;
