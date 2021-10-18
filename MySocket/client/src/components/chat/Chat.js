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
    let { room_id, room_name } = useParams();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);


    // Functions

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

        if ( formSendMsg  &&  lastMsg ) {
            if (formSendMsg.getBoundingClientRect().top < lastMsg.getBoundingClientRect().bottom) {
                formSendMsg.classList.replace('absolute-bottom', 'sticky-bottom');
            }
        }
    }

    const sendMessage = e => {
        e.preventDefault();
        if (message) {
            console.log(message);
            socket.emit('sendMessage', message, room_id, () => {
                setMessage('');
                stickySendMessageBox();
                scrollToTheEnd();
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
    }, [])

    useEffect(() => {
        socket.on('message', message => {

            // Spread operator to append all messages inside array
            setMessages([...messages, message]);
        });
        return () => {

            // Cleanup function to avoid the effects accumulation
            socket.off('message');
        }
    }, [messages])



    return (
        <div id="chat-view">
            <div>
                <div>
                    <h2>Chat</h2>
                    <div>
                        <Messages messages={messages} user_id={user._id} />
                        <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chat;