import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../UserContext';
import { Link } from 'react-router-dom';
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

    const setAsAlex = () => {
        const ale = {
            name: 'Alex',
            email: 'alex@gmail.com',
            password: '123',
            id: '123'
        }
        setUser(ale);
    }
    const setAsFloren = () => {
        const flo = {
            name: 'Floren',
            email: 'floren@gmail.com',
            password: '456',
            id: '456'
        }
        setUser(flo);
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
                    <div>
                        <a href="#" onClick={setAsAlex}>set as Alex</a>
                        <a href="#" onClick={setAsFloren}>set as Floren</a>
                    </div>
                </section>
                <section id="room-section">
                    <h2>Avaliable Rooms</h2>
                    <div id="room-list">
                        <RoomList rooms={rooms} />
                    </div>
                </section>
            </div>

            <Link to={'/chat'}>
                <button>go to chat</button>
            </Link>
        </div>
    )
}

export default Home;
