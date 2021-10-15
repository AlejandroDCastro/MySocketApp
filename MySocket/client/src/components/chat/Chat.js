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

    const scrollToTheEnd = e => {
        let divScroll = document.querySelector('#chat-view>div>div>div');
        if (divScroll) {
            divScroll.scrollTop = divScroll.scrollHeight;
        }
    }

    const sendMessage = e => {
        e.preventDefault();
        if (message) {
            console.log(message);
            socket.emit('sendMessage', message, room_id, () => {
                scrollToTheEnd();
                setMessage('');
            });
        }
    }


    // Hooks

    useEffect(() => {
        socket = io(ENDPT);
        socket.emit('join', { name: user.name, room_id, user_id: user._id });
    }, [])

    useEffect(() => {
        socket.emit('get-messages-history', room_id);
        socket.on('output-messages', messages => {
            setMessages(messages)
            scrollToTheEnd();
        });
    }, [])

    useEffect(() => {
        socket.on('message', message => {

            // Spread operator to append all messages inside array
            setMessages([...messages, message]);
        });
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