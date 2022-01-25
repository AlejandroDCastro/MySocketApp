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
    const [privateRooms, setPrivateRooms] = useState([]);
    const [privateRoomError, setPrivateRoomError] = useState('');

    const [sharedRoom, setSharedRoom] = useState('');
    const [sharedRoomError, setSharedRoomError] = useState('');
    const [sharedRooms, setSharedRooms] = useState([]);
    const [groupMember, setGroupMember] = useState('');
    const [groupMemberError, setGroupMemberError] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);


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
        let inputDiv = document.querySelector('#add-new-user>form>div:first-child');

        if (inputDiv) {
            if (privateRoom !== '') {
                inputDiv.classList.replace('labelDown', 'labelUp');
            } else {
                inputDiv.classList.replace('labelUp', 'labelDown');
            }
        }
    }, [privateRoom]);

    useEffect(() => {
        let inputDiv = document.querySelector('#add-new-group>form>div:first-child');

        if (inputDiv) {
            if (sharedRoom !== '') {
                inputDiv.classList.replace('labelDown', 'labelUp');
            } else {
                inputDiv.classList.replace('labelUp', 'labelDown');
            }
        }
    }, [sharedRoom]);

    useEffect(() => {
        let inputDiv = document.querySelector('#group-list>form>div:first-child');

        if (inputDiv) {
            if (groupMember !== '') {
                inputDiv.classList.replace('labelDown', 'labelUp');
            } else {
                inputDiv.classList.replace('labelUp', 'labelDown');
            }
        }
    }, [groupMember]);

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

    const handleSubmitSharedRoom = e => {
        e.preventDefault();

        if (groupMembers && groupMembers.length > 0) {
            setSharedRoomError('');
        } else {
            setSharedRoomError('Add some user below to create room');
        }
    }

    const handleSubmitGroupMembers = e => {
        e.preventDefault();


    }

    const changePrivateRoomValue = e => {
        setPrivateRoom(e.target.value);
    }

    const changeSharedRoomValue = e => {
        setSharedRoom(e.target.value);
    }

    const changeGroupMemberValue = e => {
        setGroupMember(e.target.value);
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
                <div>
                    <section className="formData" id="add-new-user">
                        <h2>Add new user</h2>
                        <form onSubmit={handleSubmitPrivateRoom}>
                            <div className="inputData labelDown">
                                <input type="email" id="privateRoom" required value={privateRoom} onChange={changePrivateRoomValue} />
                                <label htmlFor="privateRoom">Enter a user email</label>
                                <p>{privateRoomError}</p>
                            </div>
                            <input type="submit" value="OPEN CHAT" />
                        </form>
                    </section>
                    <section className="formData" id="add-new-group">
                        <h2>Add new group</h2>
                        <form onSubmit={handleSubmitSharedRoom}>
                            <div className="inputData labelDown">
                                <input type="text" id="sharedRoom" required value={sharedRoom} onChange={changeSharedRoomValue} />
                                <label htmlFor="sharedRoom">Enter a room name</label>
                                <p>{sharedRoomError}</p>
                            </div>
                            <input type="submit" value="OPEN CHAT" />
                        </form>
                    </section>
                    <div className="formData" id="group-list">
                        <form onSubmit={handleSubmitGroupMembers}>
                            <div className="inputData labelDown">
                                <input type="email" id="groupMember" required value={groupMember} onChange={changeGroupMemberValue} />
                                <label htmlFor="groupMember">Enter a user email</label>
                                <p>{groupMemberError}</p>
                            </div>
                            <input type="submit" value="ADD USER" />
                        </form>
                        <p>User list:</p>
                        <ul>
                            <li>No users at the moment...</li>
                        </ul>
                    </div>
                </div>
                <div>
                    <section className="roomSection" id="private-room-section">
                        <h2>Private Rooms</h2>
                        <div className="roomList" id="private-room-list">
                            <RoomList rooms={privateRooms} />
                        </div>
                    </section>
                    <section className="roomSection" id="shared-room-section">
                        <h2>Shared Rooms</h2>
                        <div className="roomList" id="shared-room-list">
                            <RoomList rooms={sharedRooms} />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default Home;
