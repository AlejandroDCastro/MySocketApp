import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../UserContext';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Messages from './messages/Messages';
import Input from './input/Input';
import './Chat.css';

let socket;
const Chat = () => {
    const ENDPT = 'localhost:5000';
    const { user, setUser } = useContext(UserContext);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [file, setFile] = useState(null);
    const [chunks, setChunks] = useState([]);
    let { room_id, room_name } = useParams();


    // Functions

    const setInputPlaceholder = (placeholder, color, readonly) => {
        let inputPlaceholder = document.querySelector('#send-message>div:first-child>input');
        inputPlaceholder.setAttribute('placeholder', placeholder);
        inputPlaceholder.style.color = color;
        if (readonly) {
            inputPlaceholder.setAttribute('readonly', 'readonly');
        } else {
            inputPlaceholder.removeAttribute('readonly');
        }
    }

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

    // Go to the chat end
    const scrollToTheEnd = e => {
        let divScroll = document.querySelector('#chat-view>div>div>div');
        if (divScroll) {
            divScroll.scrollTop = divScroll.scrollHeight;
        }
    }

    // Chat Input always on the bottom
    const stickySendMessageBox = e => {
        let formSendMsg = document.getElementById('send-message');
        let lastMsg = document.querySelector('#chat-view>div>div>div>div>div:last-child');

        if (formSendMsg && lastMsg) {
            if (formSendMsg.getBoundingClientRect().top < lastMsg.getBoundingClientRect().bottom) {
                formSendMsg.classList.replace('absolute-bottom', 'sticky-bottom');
            }
        }
    }

    const sendMessage = e => {
        e.preventDefault();

        // Send a text message or audio recorded or attached file
        if (file) {
            
        } else if (message) {
            console.log(message);

            // Emit a listener to the server
            socket.emit('sendMessage', message, room_id, () => {
                setMessage('');
                stickySendMessageBox();
                scrollToTheEnd();
            });
        } else {

            // Give permission to the App for using microphone
            navigator.mediaDevices.getUserMedia({ audio: true }).then(function (mediaStream) {
                let divIcon = document.querySelector('#send-message>div:last-child');
                let micIcon = document.querySelector('#send-message>div:last-child>i:last-child');
                let mediaRecorder = new MediaRecorder(mediaStream, {
                    mimeType: 'audio/webm'
                });

                mediaRecorder.onstart = function () {

                    // Start some animations
                    divIcon.classList.replace('send-msg-text', 'send-msg-audio');
                    setInputPlaceholder('Recording audio...', 'red', true);
                    if (!micIcon.classList.replace('stop-animation', 'run-animation')) {
                        micIcon.classList.add('run-animation');
                    }
                }
                mediaRecorder.start();

                // Audio recording splitted in items and save them
                mediaRecorder.ondataavailable = function (e) {
                    chunks.push(e.data);
                };

                mediaRecorder.onstop = function () {

                    // Restart animations
                    divIcon.classList.replace('send-msg-audio', 'send-msg-text');
                    micIcon.classList.replace('run-animation', 'stop-animation');
                    setInputPlaceholder('Type a message', 'white', false);

                    let audioBlob = new Blob(chunks, { type: 'audio/webm' });
                    setChunks([]);

                    // Download audio
                    let link = document.createElement('a');
                    link.href = window.URL.createObjectURL(audioBlob);
                    link.setAttribute('download', 'video_recorded.webm');
                    link.style.display = 'none';
                    document.getElementById('chat-view').appendChild(link);

                    link.click();
                    link.remove();
                };

                setTimeout(() => {
                    mediaRecorder.stop();
                }, 5000);

            }).catch(function (error) {
                console.log("Permission error: ", error);
            });

        }
    }


    // Hooks

    useEffect(() => {
        socket = io(ENDPT);
        socket.emit('join', { name: user.name, room_id, user_id: user._id });
    }, []) // Empty array for executing one only time

    useEffect(() => {
        socket.emit('get-messages-history', room_id);
        socket.on('output-messages', messages => {
            setMessages(messages)
            stickySendMessageBox();
            scrollToTheEnd();
        });

        return () => {
            socket.off('output-messages');
        }
    }, [])

    useEffect(() => {
        socket.on('message', message => {

            // Spread operator to append all messages inside array
            setMessages([...messages, message]);
        });

        // Cleanup function
        return () => {

            // Avoid the listener accumulation
            socket.off('message');
        }
    }, [messages])

    // Prepare an attached message
    useEffect(() => {
        let divFile = document.querySelector('#send-message>div:first-child');
        let iconFile = document.querySelector('#send-message>div:first-child>i');

        if (file) {
            setInputPlaceholder(file.name, 'yellow', true);
            showSocketIcon();
            if (divFile.childNodes.length === 1) {
                divFile.innerHTML += `<i class="fas fa-times"></i>`;
                divFile.lastChild.onclick = () => {
                    setFile(null);
                    // ERROR: Para cuando se esta escribiendo y se adjunta, y cuando se ajunta y se cierra (no se cambia el icono mientras se escribe)
                }
            }
        } else {
            setInputPlaceholder('Type a message', 'white', false);
            showAudioIcon();
            if (iconFile) {
                divFile.removeChild(iconFile);
            }
        }
    }, [file])


    return (
        <div id="chat-view">
            <div>
                <div>
                    <h2>Chat</h2>
                    <div>
                        <Messages messages={messages} user_id={user._id} />
                        <Input message={message} setMessage={setMessage} setFile={setFile} sendMessage={sendMessage} showAudioIcon={showAudioIcon} showSocketIcon={showSocketIcon} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chat;