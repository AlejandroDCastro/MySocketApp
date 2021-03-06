const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'An ID from user is needed']
    },
    color: {
        type: String,
        default: '000'
    },
    encryptedChatKey: {
        type: String,
        required: [true, 'Please save the encrypted room key for user']
    }
});

const sharedRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'You need to add a name for group']
    },
    members: {
        type: [memberSchema],
        validate: [arrayLimit, 'You need to add one user at least below'],
        required: [true, 'Please, add some user below to create room']
    },
    message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'message',
        required: false
    }
}, { timestamps: true });

function arrayLimit(array) {
    return (array.length >= 2);
}

const SharedRoom = mongoose.model('sharedroom', sharedRoomSchema);
module.exports = SharedRoom;