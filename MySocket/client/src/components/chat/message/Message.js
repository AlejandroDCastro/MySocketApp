import React from 'react';
import './Message.css'

const Message = ({ message: { name, user_id, text }, current_uid }) => {

    // Depend on client indentify align messages right or left
    let isCurrentUser = (user_id === current_uid) ? true : false;

    return (
        isCurrentUser ? (
            <div className="right-msg">
                {name}: {text}
            </div>) : (
            <div className="left-msg">
                {name}: {text}
            </div>
        )
    )
}

export default Message;
