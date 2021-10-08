import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../UserContext';
import { Link, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Messages from './messages/Messages';

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

    const changeMessage = e => {
        setMessage(e.target.value);
    }

    const pressMessage = e => {
        if (e.key === 'Enter') {
            sendMessage(e);
        }
    }


    return (
        <div>
            <div>{room_id} {room_name}</div>
            <h2>Chat {JSON.stringify(user)}</h2>
            <pre>{JSON.stringify(messages, null, '\t')}</pre>
            <Messages messages={messages} user_id={user.id} />
            <form action="" onSubmit={sendMessage}>
                <div>
                    <input type="text" value={message} onChange={changeMessage} onKeyPress={pressMessage} />
                </div>
                <div>
                    <input type="submit" value="Send Message" />
                </div>
            </form>
        </div>
    )
}

export default Chat;