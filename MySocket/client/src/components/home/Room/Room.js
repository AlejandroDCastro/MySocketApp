import React, { useState } from 'react';
import './Room.css';


const getFormatedMessage = (lastMessage, fileName) => {
    const strings = lastMessage.split('"');
    if (strings.length === 3 && fileName && fileName[0] && fileName[0] === strings[1]) {
        return (<>{strings[0]}"<span>{strings[1]}</span>"</>);
    } else {
        return lastMessage;
    }
}

const Room = ({ name, lastMessage, fileName, updatedAt }) => {

    return (
        <>
            <article>
                <h3>{name}</h3>
                <div>
                    <p>{getFormatedMessage(lastMessage, fileName)}</p>
                    <p><span>Updated: </span>{updatedAt}</p>
                </div>
            </article>
        </>
    )
}

export default Room;
