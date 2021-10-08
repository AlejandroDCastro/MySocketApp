import React from 'react';
import Message from '../message/Message';

const Messages = ({ messages, user_id }) => {
    return (
        <div>
            Messages {user_id}
            {messages.map((message, i) => (
                <Message key={message._id} message={message} current_uid={user_id} />
            ))}
        </div>
    )
}

export default Messages;
