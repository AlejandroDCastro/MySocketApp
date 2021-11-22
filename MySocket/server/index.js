const express = require('express');
const app = express();
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200 // For legacy browser support
}

app.use(cors(corsOptions));
app.use(express.json()); // Middleware that recognize the incoming Request Object as a JSON Object
app.use(cookieParser());
app.use(authRoutes);

const http = require('http').createServer(app);
const mongoose = require('mongoose');
const socketio = require('socket.io');
const io = socketio(http);
const mongoDB = "mongodb+srv://mysocket:BbEToh01@mysocket-chatapp.jkcv8.mongodb.net/mysocket-database?retryWrites=true&w=majority";
mongoose.connect(mongoDB).then(() => console.log('connected')).catch(err => console.log(err));
const { addUser, getUser, removeUser } = require('./helper');
const PORT = process.env.PORT || 5000;
const Room = require('./models/Room');
const Message = require('./models/Message');



io.on('connection', (socket) => {
    console.log(socket.id);

    Room.find().then(result => {
        socket.emit('output-rooms', result);
    });

    // Socket listeners for events

    socket.on('create-room', name => {
        //console.log('Then room name received is', name);
        const room = new Room({ name });
        room.save().then(result => {
            io.emit('room-created', result);
        });
    });

    socket.on('join', ({ name, room_id, user_id }) => {
        const { error, user } = addUser({
            socket_id: socket.id,
            name,
            room_id,
            user_id
        });

        // Add the Room id to the socket list
        socket.join(room_id);

        if (error) {
            console.log('join error', error);
        } else {
            console.log('join user', user);
        }
    });

    socket.on('sendMessage', (message, room_id, callback) => {
        const user = getUser(socket.id);
        const msgToStore = {
            name: user.name,
            user_id: user.user_id,
            room_id,
            text: message
        };
        console.log('message', msgToStore);

        // Save message
        const msg = new Message(msgToStore);
        msg.save().then(result => {

            // Send event to the clients in the same room
            io.to(room_id).emit('message', result);
            callback();
        });
    });

    socket.on('get-messages-history', room_id => {
        Message.find({ room_id }).then(result => {
            socket.emit('output-messages', result);
        });
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
    });
});


http.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
