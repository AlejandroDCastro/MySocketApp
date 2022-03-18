import React from 'react';
import './Room.css';

const Room = ({ name }) => {

    return (
        <>
            <article>
                <h3>{name}</h3>
                <div>
                    <p>[No messages yet]</p>
                    <p><span>Updated: </span>14/02/2022</p>
                </div>
            </article>
        </>
    )
}

export default Room;
