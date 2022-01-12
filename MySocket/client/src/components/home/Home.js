import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../UserContext';
import { Redirect } from 'react-router-dom';
import RoomList from './RoomList/RoomList';
import io from 'socket.io-client';
import './Home.css';

let socket;
const Home = () => {
    const ENDPT = 'localhost:5000';
    const { user, setUser } = useContext(UserContext);
    const [room, setRoom] = useState('');
    const [rooms, setRooms] = useState('');

    // Run after render DOM
    useEffect(() => {

        // Looks up an existing Manager for multiplexing
        socket = io(ENDPT);

        // Callback function after each refresh or update
        return () => {
            socket.emit('disconnect');
            socket.off();
        }
    }, [ENDPT]);

    useEffect(() => {
        let inputDiv = document.querySelector('form>div:first-child');

        if (inputDiv) {
            if (room !== '') {
                inputDiv.classList.replace('labelDown', 'labelUp');
            } else {
                inputDiv.classList.replace('labelUp', 'labelDown');
            }
        }
    }, [room]);

    useEffect(() => {
        socket.on('output-rooms', rooms => {
            setRooms(rooms);
        });

        return () => {
            socket.off('output-rooms');
        }
    }, [])

    useEffect(() => {
        socket.on('private-room-created', room => {
            setRooms([...rooms, room]);
        });

        return () => {
            socket.off('private-room-created');
        }
    }, [rooms]);

    useEffect(() => {
        console.log(rooms);
    }, [rooms]);

    const handleSubmitUser = e => {

        // Cancel the event if can
        e.preventDefault();

        // Emit a socket event
        socket.emit('create-private-room', {
            user_id: user._id,
            email: room
        });
        console.log(room);
        setRoom('');
    }

    const changeRoomValue = e => {
        setRoom(e.target.value);
    }

    // Login page first if user is not identified
    if (!user) {

        // Hide menu
        let button = document.getElementById('btn-menu')
        if (button) {
            button.checked = false;
        }

        return <Redirect to="/login" />
    }

    return (
        <div>
            <div id="home-view">
                <section className="formData" id="add-new-user">
                    <h2>Add new user</h2>
                    <form onSubmit={handleSubmitUser}>
                        <div className="inputData labelDown">
                            <input type="email" id="room" required value={room} onChange={changeRoomValue} />
                            <label htmlFor="room">Enter a user email</label>
                        </div>
                        <input type="submit" value="OPEN CHAT" />
                    </form>
                </section>
                <section id="room-section">
                    <h2>Avaliable Rooms</h2>
                    <div id="room-list">
                        <RoomList rooms={rooms} />
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Home;
