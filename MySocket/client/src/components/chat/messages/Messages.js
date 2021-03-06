import React from 'react';
import Message from '../message/Message';

const Messages = ({ messages, user_id, privacy }) => {
    let lastUserID = null;

    // Check if the last message printed is from the same user than before one
    const checkLastUserMessage = (nextIDUserMsg) => {
        if (lastUserID  &&  lastUserID === nextIDUserMsg) {
            return true;
        } else {
            lastUserID = nextIDUserMsg;
            return false;
        }
    }


    return (
        <div>
            {messages.map((message, _) => (
                <Message key={message._id} message={message} current_uid={user_id} same_user={checkLastUserMessage(message.user_id)} privacy={privacy} />
            ))}
        </div>
    )
}

export default Messages;
