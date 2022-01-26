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
const SharedRoom = require('./models/SharedRoom');
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

        // Show user private rooms avaliable
        PrivateRoom.find({
            members: user.user_id
        }).populate('members').then(result => {
            const privateRooms = [];
            result.forEach(room => {
                privateRooms.push({
                    _id: room.id,
                    name: (room.members[0].id === user.user_id) ? room.members[1].name : room.members[0].name
                });
            });
            console.log('private rooms', privateRooms);
            socket.emit('output-private-rooms', privateRooms);
        });
    });


    socket.on('check-correct-room', (email, callback) => {

        // Look for guest user
        User.findOne({ email }).then(guest => {
            const applicant = Helper.getUserBySocketID(socket.id);
            let applicant_id = undefined;

            // Check if user is introducing a correct email
            if (guest) {
                applicant_id = new mongoose.mongo.ObjectId(applicant.user_id);
            } else {
                throw 'The user introduced does not exists...';
            }
            if (applicant.user_id === guest.id) {
                throw 'You cannot talk with yourself...';
            }
            PrivateRoom.exists({
                members: {
                    $all: [
                        applicant_id,
                        guest._id
                    ]
                }
            }).then(result => {
                return callback(
                    (result) ? {
                        valid: false,
                        body: 'This chat is already opened'
                    } : {
                        valid: true,
                        body: '',
                        data: {
                            guest_id: guest.id,
                            guest_name: guest.name
                        }
                    }
                );
            });
        }).catch(error => {
            console.log(error);
            return callback({
                valid: false,
                body: error
            });
        });
    });


    socket.on('create-private-room', data => {

        const privateRoom = new PrivateRoom({
            members: [
                new mongoose.mongo.ObjectId(data.applicant_id),
                data.guest_id
            ]
        });
        privateRoom.save().then(result => {

            // Emit new Room at the moment
            console.log('private room', result);
            console.log(result.id);
            socket.emit('private-room-created', {
                _id: result.id,
                name: data.guest_name
            });

            // Check if other user is connected
            const guestConnected = Helper.getUserByID(data.guest_id);
            if (guestConnected) {
                io.to(guestConnected.socket_id).emit('private-room-created', {
                    _id: result.id,
                    name: data.applicant_name
                });
            } else {
                console.log('The guest user is not connected right now...');
            }
        });
    });


    socket.on('create-shared-room', (name, members, callback) => {
        const user = Helper.getUserBySocketID(socket.id);
        
        const sharedRoom = new SharedRoom({
            name: name,
            members: [...members, user.user_id]
        });
        sharedRoom.save().then(result => {
            console.log('result', result);
        }).catch(error => {
            console.log('error', error);
        });
    });


    socket.on('check-correct-user', (email, callback) => {
        User.findOne({ email }).then(guest => {
            const user = Helper.getUserBySocketID(socket.id);
            return callback(
                (guest) ? (
                    (user.user_id === guest.id) ? {
                        valid: false,
                        body: 'You cannot talk with yourself...'
                    } : {
                        valid: true,
                        user: guest
                    }
                ) : {
                    valid: false,
                    body: 'The user introduced does not exists...'
                }
            );
        });
    });


    socket.on('join-room', ({ user_id, room_id }) => {
        const { user, error } = Helper.joinRoom({
            socket_id: socket.id,
            user_id,
            room_id
        });

        // Add the Room ID to the socket list
        socket.join(room_id);

        if (error) {
            console.log('join error:', error);
        } else {
            console.log('join user:', user);
        }

        // Send room messages to the client
        Message.find({ room_id }).then(result => {
            console.log('messages history', result);
            socket.emit('get-message-history', result);
        });
    });


    socket.on('send-message', (message, room_id, callback) => {
        const user = Helper.getUserBySocketID(socket.id);
        const msgData = {
            name: user.name,
            user_id: user.user_id,
            room_id,
            text: message
        };
        console.log('message', msgData);

        // Save message
        const newMessage = new Message(msgData);
        newMessage.save().then(result => {

            // Send event to the clients in the same room
            io.to(room_id).emit('new-message', result);
            callback();
        });
    });


    socket.on('disconnect', () => {
        Helper.removeUserBySocketID(socket.id);
        console.log('User disconnected...');
    });
});


http.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
