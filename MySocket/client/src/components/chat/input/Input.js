import React from 'react';
import './Input.css';


const Input = ({ message, setMessage, sendMessage }) => {

    const showSocketIcon = _ => {
        let icons = document.querySelectorAll('#send-message>div:last-child>i');

        icons[1].dataset.show = "false";
        icons[0].dataset.show = "true";
    }

    const showAudioIcon = _ => {
        let icons = document.querySelectorAll('#send-message>div:last-child>i');
        
        icons[0].dataset.show = "false";
        icons[1].dataset.show = "true";
    }

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

    const clickSendMessage = e => {
        sendMessage(e);
        showAudioIcon();
    }


    return (
        <form id="send-message" className="absolute-bottom" action="" onSubmit={sendMessage}>
            <div>
                <input type="text" placeholder="Type a message" value={message} onChange={changeMessage} onKeyPress={pressMessage} />
            </div>
            <div onClick={clickSendMessage}>
                <i data-show="false" className="fas fa-plug"></i>
                <i data-show="true" className="fas fa-microphone"></i>
            </div>
        </form>
    )
}

export default Input;
