import React from 'react';
import './Room.css';

const Room = ({ name }) => {
    return (
        <>
            <article>
                <h3>{name}</h3>
            </article>
        </>
    )
}

export default Room;
