const mongoose = require('mongoose');

const privateRoomSchema = new mongoose.Schema({
    members: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'user',
        validate: [arrayLimit, 'Private Rooms are only for 2 users']
    }
});

function arrayLimit(array) {
    return (array.length === 2);
}

const PrivateRoom = mongoose.model('privateroom', privateRoomSchema);
module.exports = PrivateRoom;