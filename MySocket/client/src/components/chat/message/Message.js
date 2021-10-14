import React from 'react';
import './Message.css'

const Message = ({ message: { name, user_id, text }, current_uid }) => {

    // Depend on client indentify align messages right or left
    let isCurrentUser = (user_id === current_uid) ? true : false;
    let classNameAlign = isCurrentUser ? 'right-msg' : 'left-msg';

    return (
        <div className={classNameAlign}>
            <div>
                <p>{name}: {text}</p>
            </div>
        </div>
    )
}

export default Message;
