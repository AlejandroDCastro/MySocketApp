import React from 'react';

const Message = ({ message: { name, user_id, text }, current_uid }) => {
    return (
        <div>
            {name}: {text}
        </div>
    )
}

export default Message;
