import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../UserContext';
import { Redirect } from 'react-router-dom';
import RoomList from './RoomList/RoomList';
import Head from '../layout/head/Head';
import PrivateRoomModal from './Modal/PrivateRoomModal/PrivateRoomModal';
import io from 'socket.io-client';
import CryptoJS from 'crypto-js';
import NodeRSA from 'node-rsa';
import './Home.css';

let socket;
const Home = () => {
    const ENDPT = 'https://localhost:5000';
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

    const [symmetricKey, setSymmetricKey] = useState('');

    const [openPrivateModal, setOpenPrivateModal] = useState(false);
    const [openSharedModal, setOpenSharedModal] = useState(false);


    // Run after render DOM
    useEffect(() => {

        // Get the existing socket from server created for this client
        socket = io(ENDPT, {
            withCredentials: true
        });
        console.log('my socket is: ', socket);

        // Callback function after each refresh or update
        return () => {
            socket.emit('disconnect');
            socket.off();
        }
    }, [ENDPT]);

    useEffect(() => {
        socket.on('connect-data-server', (callback) => {
            // Create a chat key for encrypt messages
            setSymmetricKey(generateSymmetricKey());               // ESTO ES TEMPORAL!!!!!
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
        socket.on('output-shared-rooms', sharedRooms => {
            setSharedRooms(sharedRooms);
        });

        return () => {
            socket.off('output-private-rooms');
            socket.off('output-shared-rooms');
        }
    }, []);

    useEffect(() => {
        socket.on('private-room-created', privateRoom => {
            console.log('private:', privateRoom);
            setPrivateRooms([...privateRooms, privateRoom]);
        });

        return () => {
            socket.off('private-room-created');
        }
    }, [privateRooms]);

    useEffect(() => {
        console.log('private rooms', privateRooms);
    }, [privateRooms]);

    useEffect(() => {
        socket.on('shared-room-created', sharedRoom => {
            console.log('shared:', sharedRoom);
            setSharedRooms([...sharedRooms, sharedRoom]);
        });

        return () => {
            socket.off('shared-room-created');
        }
    }, [sharedRooms]);

    useEffect(() => {
        console.log('shared rooms', sharedRooms);
    }, [sharedRooms]);

    const generateSymmetricKey = _ => {
        const salt = CryptoJS.lib.WordArray.random(128 / 8);
        const key = CryptoJS.PBKDF2(user._id, salt, {
            keySize: 256 / 32,
            iterations: 500
        }).toString(CryptoJS.enc.Base64);
        return key;
    }

    const encryptionChatKey = (message, publicKey) => {
        const encryptionNode = new NodeRSA(publicKey);
        const encryptedChatKey = encryptionNode.encrypt(message, 'base64');
        return encryptedChatKey;
    }

    const handleSubmitPrivateRoom = e => {

        // Cancel the event if can
        e.preventDefault();

        // Emit a socket event
        socket.emit('check-correct-room', privateRoom, (response) => {
            if (response.valid) {

                // Encryption for both host and guest
                const hostEncryptedChatKey = encryptionChatKey(symmetricKey, user.publicKey);
                const guestEncryptedChatKey = encryptionChatKey(symmetricKey, response.body.guest_publicKey);
                console.log('host', hostEncryptedChatKey);
                console.log('guest', guestEncryptedChatKey);
                socket.emit('create-private-room', {
                    host: {
                        id: user._id,
                        name: user.name,
                        encryptedChatKey: hostEncryptedChatKey
                    },
                    guest: {
                        id: response.body.guest_id,
                        name: response.body.guest_name,
                        encryptedChatKey: guestEncryptedChatKey
                    }
                });
                setPrivateRoom('');
                setPrivateRoomError('');
                setSymmetricKey('');
            } else {
                setPrivateRoomError(<><i className="fas fa-exclamation-circle"></i><span>{response.body}</span></>);
            }
        });
    }

    const clearUsersFromList = e => {
        let listElement = document.querySelector('#group-list>ul');
        listElement.innerHTML = ``;
        let letter = document.createElement('li');
        letter.textContent = 'No users at the moment...';
        listElement.appendChild(letter);
    }

    const handleSubmitSharedRoom = e => {
        e.preventDefault();

        addUserToArray(user._id, user.publicKey);
        socket.emit('create-shared-room', sharedRoom, groupMembers, (response) => {
            if (response.valid) {
                setSharedRoomError('');
                setSharedRoom('');
                clearUsersFromList();
                setSymmetricKey('');
            } else {
                setSharedRoomError(response.body);
            }
            setGroupMembers([]);
        });
    }

    const getRandomColour = _ => {
        return (((1 << 24) * Math.random() | 0).toString(16));
    }

    const addUserToArray = (user_id, publicKey) => {
        const encryptedChatKey = encryptionChatKey(symmetricKey, publicKey);
        groupMembers.push({
            _id: user_id,
            color: getRandomColour(),
            encryptedChatKey
        });
        console.log('group members', groupMembers);
    }

    const displayUserToList = (email, name) => {
        let listElement = document.querySelector('#group-list>ul');
        let newChild = document.createElement('li');

        if (groupMembers.length === 0) {
            listElement.removeChild(listElement.firstChild);
        }
        newChild.textContent = email + ' (' + name + ')';
        listElement.appendChild(newChild);
    }

    const handleSubmitGroupMembers = e => {
        e.preventDefault();

        socket.emit('check-correct-user', groupMember, (response) => {
            if (response.valid) {
                displayUserToList(response.user.email, response.user.name);
                addUserToArray(response.user._id, response.user.publicKey);
                setGroupMemberError('');
                setGroupMember('');
            } else {
                setGroupMemberError(response.body);
            }
        });
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

    const changeChatList = (hideIdx, showIdx) => {
        let chatList = document.querySelectorAll('#home-view>div>ul>li');
        let sectionList = document.querySelectorAll('#home-view>div>div>section');

        if (chatList.length && sectionList.length) {
            
            // Change group picked
            chatList[hideIdx].classList.remove('active');
            chatList[showIdx].classList.add('active');

            // Change list
            sectionList[hideIdx].classList.remove('active');
            sectionList[showIdx].classList.add('active');
        }
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

    const privateParams = {
        handleSubmitPrivateRoom,
        privateRoom,
        changePrivateRoomValue,
        privateRoomError,
        setOpenPrivateModal
    }


    return (
        <>
            <Head />
            {openPrivateModal && <PrivateRoomModal privateParams={privateParams} />}
            <div id="home-view">
                <div>
                    <ul>
                        <li className='active' onClick={() => changeChatList(1, 0)}>Individual</li>
                        <li onClick={() => changeChatList(0, 1)}>Group</li>
                    </ul>
                    <div>
                        <section className="active" id="private-room-section">
                            <h2>Individual</h2>
                            <p>
                                <button onClick={() => setOpenPrivateModal(true)}><i className="fas fa-plus-square"></i> New chat</button>
                            </p>
                            <div className="roomList" id="private-room-list">
                                <RoomList rooms={privateRooms} type="Private" />
                            </div>
                        </section>
                        <section id="shared-room-section">
                            <h2>Group</h2>
                            <p>
                                <button><i className="fas fa-plus-square"></i> New chat</button>
                            </p>
                            <div className="roomList" id="shared-room-list">
                                <RoomList rooms={sharedRooms} type="Shared" />
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home;
