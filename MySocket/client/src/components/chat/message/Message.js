import React from 'react';
import './Message.css';

const Message = ({ message: { name, user_id, text, color }, current_uid, same_user, privacy }) => {

    // Depend on client indentify align messages right or left
    const classNameAlign = (user_id === current_uid) ? 'right-msg' : 'left-msg';
    const classMarginFromLast = same_user ? 'same-user' : 'diff-user';
    const styleClasses = classNameAlign + ' ' + classMarginFromLast;
    const display = (styleClasses === 'left-msg diff-user' && privacy === 'Shared') ? 'flex' : 'none';
    const nameColour = {
        color: color,
        display: display
    };


    return (
        <div className={styleClasses}>
            <div>
                <p style={nameColour}>{name}</p>
                <p>{text}</p>
            </div>
        </div>
    )
}

export default Message;
