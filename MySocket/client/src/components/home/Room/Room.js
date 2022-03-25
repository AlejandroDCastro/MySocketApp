import React from 'react';
import './Room.css';


const Room = ({ name, lastMessage, fileName, updatedAt }) => {
    const colorMsg = (lastMessage.indexOf(fileName[0]) !== -1) ? '#654fe3' : '#7c7c7c';
    const fileColour = {
        color: colorMsg
    }

    return (
        <>
            <article>
                <h3>{name}</h3>
                <div>
                    <p style={fileColour}>{lastMessage}</p>
                    <p><span>Updated: </span>{updatedAt}</p>
                </div>
            </article>
        </>
    )
}

export default Room;
