import React from 'react';
import './Message.css';

const Message = ({ message: { name, user_id, text }, current_uid, same_user }) => {

    // Depend on client indentify align messages right or left
    let classNameAlign = (user_id === current_uid) ? 'right-msg' : 'left-msg';
    let classMarginFromLast = same_user ? 'same-user' : 'diff-user';
    let styleClasses = classNameAlign + ' ' + classMarginFromLast;

    return (
        <div className={styleClasses}>
            <div>
                <p>{text}</p>
            </div>
        </div>
    )
}

export default Message;
