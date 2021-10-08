import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../UserContext';
import { Link, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Messages from './messages/Messages';
import Input from './input/Input';

let socket;
const Chat = () => {
    const ENDPT = 'localhost:5000';
    const { user, setUser } = useContext(UserContext);
    let { room_id, room_name } = useParams();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    // Hooks

    useEffect(() => {
        socket = io(ENDPT);
        socket.emit('join', { name: user.name, room_id, user_id: user.id });
    }, [])

    useEffect(() => {
        socket.emit('get-messages-history', room_id);
        socket.on('output-messages', messages => {
            setMessages(messages)
        });
    }, [])

    useEffect(() => {
        socket.on('message', message => {

            // Spread operator to append all messages inside array
            setMessages([...messages, message]);
        });
    }, [messages])


    // Functions

    const sendMessage = e => {
        e.preventDefault();
        if (message) {
            console.log(message);
            socket.emit('sendMessage', message, room_id, () => setMessage(''));
        }
    }


    return (
        <div>
            <Messages messages={messages} user_id={user.id} />
            <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
        </div>
    )
}

export default Chat;