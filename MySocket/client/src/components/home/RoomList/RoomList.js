import React from 'react';
import Room from '../Room/Room';
import { Link } from 'react-router-dom';
import './RoomList.css';
import { useContext } from 'react';

const RoomList = ({ user, rooms, type, setOpenModal }) => {


    return ((rooms && rooms.length > 0) ?
        <div className='room-list'>
            {rooms.map(room => (
                <Link onClick={() => { user.chatting = true }} to={'/chat/' + room.color + '/' + type + '/' + room._id + '/' + room.name} key={room._id}>
                    <Room name={room.name} />
                </Link>
            ))}
        </div> : <p className='msg-empty-list'>
            There is no chat yet. <span onClick={() => setOpenModal(true)}>Create one</span>.
        </p>
    )
}

export default RoomList;
