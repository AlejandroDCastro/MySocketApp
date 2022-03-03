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
    type: {
        type: String,
        enum: ['text', 'audio/webm', 'file']
    },
    color: {
        type: String,
        default: '#000'
    }
}, { timestamps: true })

const message = mongoose.model('message', messageSchema);
module.exports = message;