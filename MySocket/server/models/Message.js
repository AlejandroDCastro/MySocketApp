const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    room_id: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: '#000',
        required: true
    },
    fileName: {
        type: String,
        required: false
    }
}, { timestamps: true })

const message = mongoose.model('message', messageSchema);
module.exports = message;