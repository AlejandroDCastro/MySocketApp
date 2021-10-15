import React from 'react';
import './Input.css';


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
        <form id="send-message" action="" onSubmit={sendMessage}>
            <div>
                <input type="text" placeholder="Type a message" value={message} onChange={changeMessage} onKeyPress={pressMessage} />
            </div>
            <div>
                <input type="submit" value="Sendfs" />
            </div>
        </form>
    )
}

export default Input;
