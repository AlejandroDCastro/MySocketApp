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
    const [privateRoom, setPrivateRoom] = useState('');
    const [privateRooms, setPrivateRooms] = useState('');
    const [privateRoomError, setPrivateRoomError] = useState('');

    // Run after render DOM
    useEffect(() => {

        // Get the existing socket from server created for this client
        socket = io(ENDPT);
        console.log('my socket is: ', socket);

        // Callback function after each refresh or update
        return () => {
            socket.emit('disconnect');
            socket.off();
        }
    }, [ENDPT]);

    useEffect(() => {
        socket.on('connect-data-server', (callback) => {
            return callback({
                name: user.name,
                user_id: user._id
            });
        });

        return () => {
            socket.off('connect-data-server');
        }
    }, [ENDPT])

    useEffect(() => {
        let inputDiv = document.querySelector('form>div:first-child');

        if (inputDiv) {
            if (privateRoom !== '') {
                inputDiv.classList.replace('labelDown', 'labelUp');
            } else {
                inputDiv.classList.replace('labelUp', 'labelDown');
            }
        }
    }, [privateRoom]);

    useEffect(() => {
        socket.on('output-private-rooms', privateRooms => {
            setPrivateRooms(privateRooms);
        });

        return () => {
            socket.off('output-private-rooms');
        }
    }, []);

    useEffect(() => {
        socket.on('private-room-created', privateRoom => {
            console.log('private:',privateRoom);
            setPrivateRooms([...privateRooms, privateRoom]);
        });

        return () => {
            socket.off('private-room-created');
        }
    }, [privateRooms]);

    useEffect(() => {
        console.log(privateRooms);
    }, [privateRooms]);


    const handleSubmitPrivateRoom = e => {

        // Cancel the event if can
        e.preventDefault();

        // Emit a socket event
        socket.emit('check-correct-room', privateRoom, (response) => {
            if (response.valid) {
                socket.emit('create-private-room', {
                    applicant_id: user._id,
                    applicant_name: user.name,
                    guest_id: response.data.guest_id,
                    guest_name: response.data.guest_name
                });
                setPrivateRoom('');
            }
            setPrivateRoomError(response.body);
        });
    }

    const changePrivateRoomValue = e => {
        setPrivateRoom(e.target.value);
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
                    <form onSubmit={handleSubmitPrivateRoom}>
                        <div className="inputData labelDown">
                            <input type="email" id="room" required value={privateRoom} onChange={changePrivateRoomValue} />
                            <label htmlFor="room">Enter a user email</label>
                            <p>{privateRoomError}</p>
                        </div>
                        <input type="submit" value="OPEN CHAT" />
                    </form>
                </section>
                <section id="room-section">
                    <h2>Avaliable Rooms</h2>
                    <div id="room-list">
                        <RoomList rooms={privateRooms} />
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Home;
