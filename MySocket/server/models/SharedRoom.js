const mongoose = require('mongoose');

const sharedRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    users: {
        type: String,
        required: true
    }
});

const SharedRoom = mongoose.model('sharedroom', roomSchema);
module.exports = SharedRoom;