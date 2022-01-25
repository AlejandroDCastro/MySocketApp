import React from 'react';
import Room from '../Room/Room';
import { Link } from 'react-router-dom';

const RoomList = ({ rooms }) => {

    return ( (rooms && rooms.length > 0) ?
        <div>
            {rooms.map(room => (
                <Link to={'/chat/' + room._id + '/' + room.name} key={room._id}>
                    <Room name={room.name} />
                </Link>
            ))}
        </div> : <p>
            There are no rooms. Create one at side.
        </p>
    )
}

export default RoomList;
