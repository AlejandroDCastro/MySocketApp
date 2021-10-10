import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../UserContext';
import { Link, Redirect } from 'react-router-dom';
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
        socket.on('output-rooms', rooms => {
            setRooms(rooms);
        });
    }, [])

    useEffect(() => {
        socket.on('room-created', room => {
            setRooms([...rooms, room]);
        });
    }, [rooms]);

    useEffect(() => {
        console.log(rooms);
    }, [rooms]);

    const handleSubmit = e => {

        // Cancel the event if can
        e.preventDefault();

        // Emit a socket event
        socket.emit('create-room', room);
        console.log(room);
        setRoom('');
    }

    const changeRoomValue = e => {
        setRoom(e.target.value);
    }

    // Login first if user is not identified
    if (!user) {
        return <Redirect to="/login" />
    }


    return (
        <div>
            <div id="home-view">
                <section id="create-room">
                    <h2>Welcome {user ? user.name : ''}</h2>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="room">Room</label>
                            <input type="text" id="room" placeholder="Enter a room name" required value={room} onChange={changeRoomValue} />
                        </div>
                        <input type="submit" value="CREATE ROOM" />
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
