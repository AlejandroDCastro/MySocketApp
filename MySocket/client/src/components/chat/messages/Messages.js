import React from 'react';
import Message from '../message/Message';
import STB from 'react-scroll-to-bottom';

const Messages = ({ messages, user_id }) => {

    return (
        <div>
            {messages.map((message, i) => (
                <Message key={message._id} message={message} current_uid={user_id} />
            ))}
        </div>
    )
}

export default Messages;
