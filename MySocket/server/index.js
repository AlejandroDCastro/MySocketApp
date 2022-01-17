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
mongoose.connect(mongoDB).then(() => console.log('database connected')).catch(err => console.log(err));
const { Helper } = require('./helper');
const PORT = process.env.PORT || 5000;
const PrivateRoom = require('./models/PrivateRoom');
const Message = require('./models/Message');
const User = require('./models/User');


// Socket listeners for events
io.on('connection', (socket) => {
    console.log(socket.id);


    // Save data for users connected
    socket.emit('connect-data-server', (response) => {
        const user = Helper.addUser({
            socket_id: socket.id,
            name: response.name,
            user_id: response.user_id,
            room_id: ''
        });
      /*  Response
        socket.emit('output-private-rooms', () => {
            console.log('FFFFFFFFFFFFFFFFFFFFFFFFFFFFF');
        });*/
    });


    socket.on('create-private-room', email => {

        // Look for guest user
        User.findOne({ email }).then(guest => {
            const applicant = Helper.getUserBySocketID(socket.id);

            // Check if user is introducing its email
            if (applicant.user_id === guest.id) {
                console.log('Introduce an existing user...');
                return;
            }

            const privateRoom = new PrivateRoom({
                users_id: [
                    applicant.user_id,
                    guest.id
                ]
            });
            privateRoom.save().then(result => {

                // Emit new Room at the moment
                console.log('private room', result);
                socket.emit('private-room-created', {
                    room_id: result.id,
                    name: guest.name
                });

                // Check if other user is connected
                const guestConnected = Helper.getUserByID(guest.id);
                if (guestConnected) {
                    io.to(guestConnected.socket_id).emit('private-room-created', {
                        room_id: result.id,
                        name: applicant.name
                    });
                } else {
                    console.log('The guest user is not connected right now...');
                }
            });
        }).catch(error => {
            console.log(error);
            console.log('The user entered does not exist...');
        });
    });

    /*
        PrivateRoom.find().then(result => {
            socket.emit('output-private-rooms', result);
        });*/
    /*
    
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
    
            // Add the Room ID to the socket list
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
        });*/

    socket.on('disconnect', () => {
        Helper.removeUserBySocketID(socket.id);
        console.log('User disconnected...');
    });
});


http.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
