import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../UserContext';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Messages from './messages/Messages';
import Input from './input/Input';
import CryptoJS from 'crypto-js';
import NodeRSA from 'node-rsa';
import './Chat.css';

// We put variables outside the component to prevent rerender
let socket, chatKey = '', chunks = [], mediaRecorder = null;

const Chat = () => {
    const ENDPT = 'https://localhost:5000';
    const { user, setUser } = useContext(UserContext);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [file, setFile] = useState(null);
    //const [chunks, setChunks] = useState([]);
    //const [chatKey, setChatKey] = useState('');
    let { color, privacy, room_id, room_name } = useParams();


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
    const scrollToTheEnd = _ => {
        let divScroll = document.querySelector('#chat-view>div>div>div');
        if (divScroll) {
            divScroll.scrollTop = divScroll.scrollHeight;
        }
    }

    // Chat Input always on the bottom
    const stickySendMessageBox = _ => {
        let formSendMsg = document.getElementById('send-message');
        let lastMsg = document.querySelector('#chat-view>div>div>div>div>div:last-child');

        if (formSendMsg && lastMsg) {
            if (formSendMsg.getBoundingClientRect().top < lastMsg.getBoundingClientRect().bottom) {
                formSendMsg.classList.replace('absolute-bottom', 'sticky-bottom');
            }
        }
    }

    const decryptionChatKey = (cryptogram) => {
        const privateKey = localStorage.getItem('privateKey');
        const decryptionNode = new NodeRSA(privateKey);
        const chatKey = decryptionNode.decrypt(cryptogram, 'utf8');
        return chatKey;
    }

    const encryptionMessage = (msg, key) => {
        const cryptogram = CryptoJS.AES.encrypt(msg, key, CryptoJS.enc.Base64);
        return cryptogram.toString();
    }

    const decryptionMessage = (msg, key) => {
        const decryptedMsg = CryptoJS.AES.decrypt(msg, key);
        return decryptedMsg.toString(CryptoJS.enc.Utf8);
    }

    const sendMessage = (message, fileName = '') => {

        // Encrypt message with chat key
        const cryptogram = encryptionMessage(message, chatKey);
        const hexColor = '#' + color;

        // Emit a listener to the server
        socket.emit('send-message', {
            message: cryptogram,
            color: hexColor,
            fileName
        }, room_id, () => {
            setMessage('');
            stickySendMessageBox();
            scrollToTheEnd();
        });
    }

    const submitSendMessage = e => {
        e.preventDefault();

        // Send a text message or audio recorded or attached file
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                const data = reader.result;

                // Put the name to the file
                sendMessage(data, file.name);
                setFile(null);
            }
        } else if (message) {

            sendMessage(message);
        } else {

            // Give permission to the App for using microphone
            navigator.mediaDevices.getUserMedia({ audio: true }).then(function (mediaStream) {
                let divIcon = document.querySelector('#send-message>div:last-child');
                let micIcon = document.querySelector('#send-message>div:last-child>i:last-child');
                if (mediaRecorder === null) {
                    mediaRecorder = new MediaRecorder(mediaStream, {
                        mimeType: 'audio/webm'
                    });
                } else {
                    mediaRecorder.stop();
                    mediaRecorder = null;
                    return;
                }

                mediaRecorder.onstart = function () {

                    // Start some animations
                    divIcon.classList.replace('send-msg-text', 'send-msg-audio');
                    setInputPlaceholder('Recording audio...', 'red', true);
                    if (!micIcon.classList.replace('stop-animation', 'run-animation')) {
                        micIcon.classList.add('run-animation');
                    }
                }

                // Audio recording splitted in items and save them
                mediaRecorder.ondataavailable = function (e) {
                    chunks.push(e.data);
                };

                mediaRecorder.onstop = function () {

                    // Restart animations
                    divIcon.classList.replace('send-msg-audio', 'send-msg-text');
                    micIcon.classList.replace('run-animation', 'stop-animation');
                    setInputPlaceholder('Type a message', 'white', false);

                    // Prepare to send data to server
                    let audioBlob = new Blob(chunks, { type: 'audio/webm' });

                    // Download the audio
                    /*let link = document.createElement('a');
                    link.href = window.URL.createObjectURL(audioBlob);
                    link.setAttribute('download', 'video_recorded.webm');
                    link.style.display = 'none';
                    document.getElementById('chat-view').appendChild(link);
                    link.click();
                    link.remove();*/

                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onload = function () {
                        const data = reader.result;
                        sendMessage(data, 'audio_recorded.webm');
                    }
                    //setChunks([]);
                    chunks = [];
                };

                if (mediaRecorder !== null) {
                    mediaRecorder.start();
                }

            }).catch(function (error) {
                console.log("Permission error: ", error);
            });

        }
    }


    // Hooks

    useEffect(() => {
        socket = io(ENDPT);
        console.log('my socket is: ', socket);
        socket.emit('join-room', {
            user_id: user._id,
            room_id: room_id,
            privacy
        }, (response) => {
            console.log(response);
            chatKey = decryptionChatKey(response.encryptedChatKey);
            //setChatKey(symmetricKey);

            // Decrypt all messages donwloaded from server
            response.messages.forEach(message => {
                message.text = decryptionMessage(message.text, chatKey);
            });
            setMessages(response.messages);
            stickySendMessageBox();
            scrollToTheEnd();
        });
    }, []) // Empty array for executing one only time each refresh

    useEffect(() => {
        socket.on('new-message', message => {
            message.text = decryptionMessage(message.text, chatKey);

            // Spread operator to append all messages inside array
            setMessages([...messages, message]);
        });

        // Cleanup function
        return () => {

            // Avoid the listener accumulation
            socket.off('new-message');
        }
    }, [messages])

    // Prepare an attached message
    useEffect(() => {
        let divFile = document.querySelector('#send-message>div:first-child');

        if (file) {
            setInputPlaceholder(file.name, 'yellow', true);
            showSocketIcon();
            divFile.lastChild.style.display = 'initial';
            divFile.lastChild.onclick = () => {
                setFile(null);
                // ERROR: Para cuando se esta escribiendo y se adjunta, y cuando se ajunta y se cierra (no se cambia el icono mientras se escribe)
            }
        } else {
            setInputPlaceholder('Type a message', 'white', false);
            showAudioIcon();
            divFile.lastChild.style.display = 'none';
            divFile.firstChild.focus();
        }
    }, [file])


    return (
        <div id="chat-view">
            <div>
                <div>
                    <h2>
                        <span>{room_name}</span>
                        <span>[{privacy}]</span>
                    </h2>
                    <div>
                        <Messages messages={messages} user_id={user._id} privacy={privacy} />
                        <Input message={message} setMessage={setMessage} setFile={setFile} sendMessage={submitSendMessage} showAudioIcon={showAudioIcon} showSocketIcon={showSocketIcon} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chat;