import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../UserContext';
import { Redirect } from 'react-router-dom';
import RoomList from './RoomList/RoomList';
import Head from '../layout/head/Head';
import PrivateRoomModal from './Modal/PrivateRoomModal/PrivateRoomModal';
import SharedRoomModal from './Modal/SharedRoomModal/SharedRoomModal';
import io from 'socket.io-client';
import CryptoJS from 'crypto-js';
import NodeRSA from 'node-rsa';
import './Home.css';

const decryptionChatKey = (cryptogram) => {
    const privateKey = localStorage.getItem('privateKey');
    const decryptionNode = new NodeRSA(privateKey);
    const chatKey = decryptionNode.decrypt(cryptogram, 'utf8');
    return chatKey;
}

const decryptionMessage = (msg, key) => {
    if (msg[0]) {
        const decryptedMsg = CryptoJS.AES.decrypt(msg[0], key);
        const displayMsg = String('"' + decryptedMsg.toString(CryptoJS.enc.Utf8) + '"');
        return displayMsg;
    } else {
        return '[No message yet]';
    }
}

const getFormattedData = (date) => {
    let invertData = date.slice(0, 10);
    let data = invertData.split('-');
    let formattedDate = data[2] + '/' + data[1] + '/' + data[0];
    return formattedDate;
}

const generateSymmetricKey = (secret) => {
    const salt = CryptoJS.lib.WordArray.random(128 / 8);
    const key = CryptoJS.PBKDF2(secret, salt, {
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

const decryptRoomData = (room, key) => {
    key = decryptionChatKey(key);
    room.lastMessage = decryptionMessage(room.lastMessage, key);
    room.updatedAt = getFormattedData(room.updatedAt);
    return room;
}

let socket;
const Home = () => {
    const ENDPT = 'https://localhost:5000';
    const { user, setUser } = useContext(UserContext);

    const [privateRoom, setPrivateRoom] = useState('');
    const [privateRooms, setPrivateRooms] = useState([]);
    //const [privateRoomKeys, setPrivateRoomKeys] = useState([]);
    const [privateRoomError, setPrivateRoomError] = useState('');

    const [sharedRoom, setSharedRoom] = useState('');
    const [sharedRoomError, setSharedRoomError] = useState('');
    const [sharedRooms, setSharedRooms] = useState([]);
    //const [sharedRoomKeys, setSharedRoomKeys] = useState([]);
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
            
            //setSymmetricKey(generateSymmetricKey());               // ESTO ES TEMPORAL!!!!!
            return callback({
                name: user.name,
                user_id: user._id
            });
        });

        return () => {
            socket.off('connect-data-server');
        }
    }, [ENDPT]);

    useEffect(() => {
        socket.on('output-private-rooms', privateRooms => {
            let roomList = [];
            privateRooms[0].forEach((room, i) => {
                roomList.push(decryptRoomData(room, privateRooms[1][i].chatKey));
            });
            setPrivateRooms(roomList);
        });
        socket.on('output-shared-rooms', sharedRooms => {
            let roomList = [];
            sharedRooms[0].forEach((room, i) => {
                let roomData = decryptRoomData(room, sharedRooms[1][i].chatKey);
                if (roomData.lastMessage !== '[No message yet]') {
                    roomData.lastMessage = roomData.messageAuthor + ': ' + roomData.lastMessage;
                }
                delete roomData.messageAuthor;
                roomList.push(roomData);
            });
            setSharedRooms(roomList);
        });

        return () => {
            socket.off('output-private-rooms');
            socket.off('output-shared-rooms');
        }
    }, []);

    useEffect(() => {
        socket.on('private-room-created', privateRoom => {
            const newPrivateRoom = decryptRoomData(privateRoom[0], privateRoom[1]);
            setPrivateRooms([newPrivateRoom, ...privateRooms]);
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
            const newSharedRoom = decryptRoomData(sharedRoom[0], sharedRoom[1]);
            setSharedRooms([newSharedRoom, ...sharedRooms]);
        });

        return () => {
            socket.off('shared-room-created');
        }
    }, [sharedRooms]);

    useEffect(() => {
        console.log('shared rooms', sharedRooms);
    }, [sharedRooms]);


    const openModal = (setOpenModal) => {
        setOpenModal(true);

        // Create a chat key for encrypt messages
        setSymmetricKey(generateSymmetricKey(user._id));
    }

    const closeModal = (setOpenModal, id) => {
        let modalElement = document.getElementById(id);
        //let roomListElement = document.querySelector('#home-view>div:last-child>div>section>div'); // IMPORTANTE
        
        modalElement.classList.replace('modal-fade-in', 'modal-fade-out');
        setTimeout(() => {
            setSymmetricKey('');

            // Go to the last element
            //roomListElement.scrollTop = roomListElement.scrollHeight;

            // Close modal
            setOpenModal(false);
        }, 500);
    }

    const handleSubmitPrivateRoom = e => {

        // Cancel the event if can
        e.preventDefault();

        // Emit a socket event
        socket.emit('check-correct-room', privateRoom, (response) => {
            if (response.valid) {
                closeModal(setOpenPrivateModal, 'add-new-user');

                // Encryption for both host and guest
                const hostEncryptedChatKey = encryptionChatKey(symmetricKey, user.publicKey);
                const guestEncryptedChatKey = encryptionChatKey(symmetricKey, response.body.guest_publicKey);
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

        closeModal(setOpenSharedModal, 'add-new-group');

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

    const changeChatList = (hideIdx, showIdx) => {
        let chatList = document.querySelectorAll('#home-view>div>ul>li');
        let sectionList = document.querySelectorAll('#home-view>div>div>section');

        if (chatList.length && sectionList.length) {
            
            // Change group picked
            chatList[hideIdx].classList.replace('active', 'inactive');
            chatList[showIdx].classList.replace('inactive', 'active');
            sessionStorage.setItem('privateRoom', 'active');
            sessionStorage.setItem('sharedRoom', 'inactive');

            // Change list
            sectionList[hideIdx].classList.replace('active', 'inactive');
            sectionList[showIdx].classList.replace('inactive', 'active');
        }

        if (hideIdx === 1) {
            sessionStorage.setItem('privateRoom', 'active');
            sessionStorage.setItem('sharedRoom', 'inactive');
        } else {
            sessionStorage.setItem('privateRoom', 'inactive');
            sessionStorage.setItem('sharedRoom', 'active');
        }
    }

    // Login page first if user is not identified
    if (!user) {

        // Hide menu
        let button = document.getElementById('btn-menu');
        if (button) {
            button.checked = false;
        }

        return <Redirect to="/login" />
    }


    const privateParams = {
        handleSubmitPrivateRoom,
        privateRoom,
        setPrivateRoom,
        privateRoomError,
        setOpenPrivateModal
    }

    const sharedParams = {
        handleSubmitSharedRoom,
        handleSubmitGroupMembers,
        sharedRoom,
        groupMember,
        setSharedRoom,
        setGroupMember,
        sharedRoomError,
        groupMemberError,
        setOpenSharedModal
    }


    return (
        <>
            <Head />
            {openPrivateModal && <PrivateRoomModal privateParams={privateParams} />}
            {openSharedModal && <SharedRoomModal sharedParams={sharedParams}/>}
            <div id="home-view">
                <div>
                    <ul>
                        <li className={sessionStorage.getItem('privateRoom')} onClick={() => changeChatList(1, 0)}>Individual</li>
                        <li className={sessionStorage.getItem('sharedRoom')} onClick={() => changeChatList(0, 1)}>&nbsp;&nbsp;&nbsp;Group&nbsp;&nbsp;&nbsp;</li>
                    </ul>
                    <div>
                        <section className={sessionStorage.getItem('privateRoom')} id="private-room-section">
                            <h2>Individual</h2>
                            <p>
                                <button onClick={() => openModal(setOpenPrivateModal)}><i className="fas fa-plus-square"></i> New chat</button>
                            </p>
                            <div id="private-room-list">
                                <RoomList user={user} rooms={privateRooms} type="Private" setOpenModal={setOpenPrivateModal} />
                            </div>
                        </section>
                        <section className={sessionStorage.getItem('sharedRoom')} id="shared-room-section">
                            <h2>Group</h2>
                            <p>
                                <button onClick={() => openModal(setOpenSharedModal)}><i className="fas fa-plus-square"></i> New chat</button>
                            </p>
                            <div id="shared-room-list">
                                <RoomList user={user} rooms={sharedRooms} type="Shared" setOpenModal={setOpenSharedModal} />
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home;
