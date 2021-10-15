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
        <div id="form-chat">
            <form id="send-message" action="" onSubmit={sendMessage}>
                <div>
                    <input type="text" placeholder="Type a message" value={message} onChange={changeMessage} onKeyPress={pressMessage} />
                </div>
                <div onClick={sendMessage}>
                    <i class="fas fa-plug"></i>
                </div>
            </form>
        </div>
    )
}

export default Input;
