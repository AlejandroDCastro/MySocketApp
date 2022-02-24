const mongoose = require('mongoose');
/*
const memberSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'An ID from user is needed']
    },
    encryptedRoomKey: {
        type: String,
        required: [true, 'Please save the encrypted room key for user']
    }
});

const privateRoomSchema = new mongoose.Schema({
    members: {
        type: [memberSchema],
        validate: [arrayLimit, 'Private Rooms are only for 2 users'],
        required: [true, 'You need to add some user']
    }
}, { timestamps: true });*/

const privateRoomSchema = new mongoose.Schema({
    members: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'user',
        validate: [arrayLimit, 'Private Rooms are only for 2 users'],
        required: [true, 'You need to add some user']
    }
}, { timestamps: true });

function arrayLimit(array) {
    return (array.length === 2);
}

const PrivateRoom = mongoose.model('privateroom', privateRoomSchema);
module.exports = PrivateRoom;