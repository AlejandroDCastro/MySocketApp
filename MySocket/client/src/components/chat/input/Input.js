import React from 'react';
import './Input.css';


const Input = ({ message, setMessage, setFile, sendMessage, showAudioIcon, showSocketIcon }) => {

    const changeMessage = e => {
        let message = e.target.value;

        setMessage(message);

        // Change options to send message or record audio
        if (message === "") {
            showAudioIcon();
        } else {
            showSocketIcon();
        }
    }

    const pressMessage = e => {
        if (e.key === 'Enter') {
            sendMessage(e);
            showAudioIcon();
        }
    }

    const changeFileValue = e => {
        setFile(e.target.files[0]);
    }

    const clickSendMessage = e => {
        sendMessage(e);
        showAudioIcon();
    }


    return (
        <form id="send-message" className="absolute-bottom" action="" onSubmit={sendMessage}>
            <div>
                <input type="text" placeholder="Type a message" value={message} onChange={changeMessage} onKeyPress={pressMessage} />
            </div>
            <div className="send-msg-text">
                <input type="file" onChange={changeFileValue} />
                <i className="fas fa-paperclip"></i>
            </div>
            <div className="send-msg-text" onClick={clickSendMessage}>
                <i data-show="false" className="fas fa-plug"></i>
                <i data-show="true" className="fas fa-microphone"></i>
            </div>
        </form>
    )
}

export default Input;
