const mongoose = require('mongoose');

const sharedRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'You need to add a name for group']
    },
    members: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'user',
        validate: [arrayLimit, 'Shared Room are created with 2 users at least'],
        required: [true, 'Please, add some user below to create room']
    }
});

function arrayLimit(array) {
    return (array.length >= 2);
}

const SharedRoom = mongoose.model('sharedroom', sharedRoomSchema);
module.exports = SharedRoom;