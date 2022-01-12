const mongoose = require('mongoose');

const privateRoomSchema = new mongoose.Schema({
    users_id: {
        type: [String]
    }
});

const PrivateRoom = mongoose.model('privateroom', privateRoomSchema);
module.exports = PrivateRoom;