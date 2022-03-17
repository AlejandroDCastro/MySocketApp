import React from 'react';
import Room from '../Room/Room';
import { Link } from 'react-router-dom';
import './RoomList.css';

const RoomList = ({ rooms, type }) => {


    return ((rooms && rooms.length > 0) ?
        <div className='room-list'>
            {rooms.map(room => (
                <Link to={'/chat/' + room.color + '/' + type + '/' + room._id + '/' + room.name} key={room._id}>
                    <Room name={room.name} />
                </Link>
            ))}
        </div> : <p>
            There are no rooms. Create one at side.
        </p>
    )
}

export default RoomList;
