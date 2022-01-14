const mongoose = require('mongoose');

const privateRoomSchema = new mongoose.Schema({
    users_id: {
        type: [String],
        validate: [arrayLimit, 'Private Rooms are only for 2 users']
    }
});

function arrayLimit(array) {
    return (array.length === 2);
}

const PrivateRoom = mongoose.model('privateroom', privateRoomSchema);
module.exports = PrivateRoom;