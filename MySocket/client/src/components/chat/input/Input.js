import React from 'react';

const Input = ({ message, setMessage, sendMessage }) => {

    const changeMessage = e => {
        setMessage(e.target.value);
    }

    const pressMessage = e => {
        if (e.key === 'Enter') {
            sendMessage(e);
        }
    }


    return (
        <form action="" onSubmit={sendMessage}>
            <div>
                <input type="text" placeholder="Type a message" value={message} onChange={changeMessage} onKeyPress={pressMessage} />
            </div>
            <div>
                <input type="submit" value="Send Message" />
            </div>
        </form>
    )
}

export default Input;
