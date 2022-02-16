const express = require('express');
const fs = require('fs');
//const http = require('http');
const https = require('https');
const app = express();
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const corsOptions = {
    origin: 'https://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200 // For legacy browser support
}

app.use(cors(corsOptions));
app.use(express.json()); // Middleware that recognize the incoming Request Object as a JSON Object
app.use(cookieParser());
app.use(authRoutes);

//const server = http.createServer(app);
const server = https.createServer({
    cert: fs.readFileSync('./certificates/server.crt'),
    key: fs.readFileSync('./certificates/key.pem')
}, app);
const mongoose = require('mongoose');
const socketio = require('socket.io');
const io = socketio(server);
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
        const objUserID = new mongoose.mongo.ObjectId(user.user_id);

        // Show user private rooms avaliable
        PrivateRoom.aggregate([
            { $match: { members: objUserID } },
            { $lookup: { from: 'users', localField: 'members', foreignField: '_id', as: 'user' } },
            {
                $project: {
                    _id: true,
                    user: true,
                    updatedAt: true
                }
            },
            { $unwind: "$user" },
            {
                $redact: {
                    $cond: {
                        if: { $eq: ["$user._id", objUserID] },
                        then: "$$PRUNE",
                        else: "$$DESCEND"
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$user.name" },
                    color: { $first: "000" },
                    updatedAt: { $first: "$updatedAt" }
                }
            },
            { $sort: { updatedAt: 1 } },
            {
                $project: {
                    _id: true,
                    name: true,
                    color: true
                }
            }
        ]).then(result => {
            console.log('private rooms', result);
            socket.emit('output-private-rooms', result);
        }).catch(error => {
            console.log('Output public rooms:', error);
        });

        // Show user shared rooms avaliable
        SharedRoom.aggregate([
            { $match: { "members._id": objUserID } },
            {
                $project: {
                    name: true,
                    members: true,
                    updatedAt: true
                }
            },
            { $unwind: "$members" },
            { $match: { "members._id": objUserID } },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    color: { $first: "$members.color" },
                    updatedAt: { $first: "$updatedAt" }
                }
            },
            { $sort: { updatedAt: 1 } },
            {
                $project: {
                    _id: true,
                    name: true,
                    color: true
                }
            }
        ]).then(result => {
            console.log('shared rooms', result);
            socket.emit('output-shared-rooms', result);
        }).catch(error => {
            console.log('Output shared rooms:', error);
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
            socket.emit('private-room-created', {
                _id: result.id,
                name: data.guest_name,
                color: '000'
            });

            // Check if other user is connected
            const guestConnected = Helper.getUserByID(data.guest_id);
            if (guestConnected) {
                io.to(guestConnected.socket_id).emit('private-room-created', {
                    _id: result.id,
                    name: data.applicant_name,
                    color: '000'
                });
            } else {
                console.log('The guest user is not connected right now...');
            }
        });
    });


    socket.on('create-shared-room', (name, members, callback) => {

        const sharedRoom = new SharedRoom({
            name: name,
            members: members
        });
        sharedRoom.save().then(result => {
            console.log('new shared room', result);
            result.members.forEach(member => {
                const userConnected = Helper.getUserByID(member.id);
                if (userConnected) {
                    const roomData = {
                        _id: result.id,
                        name: result.name,
                        color: member.color
                    }
                    io.to(userConnected.socket_id).emit('shared-room-created', roomData);
                } else {
                    console.log('The user ' + member.id + ' is not connected right now');
                }
            });
            return callback({
                valid: true
            });
        }).catch(error => {
            const errorMessage = error.errors.members.properties.message;
            console.log('error', errorMessage);
            return callback({
                valid: false,
                body: errorMessage//ESTO FALLA
            });
            //console.log('errores', error)
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


    socket.on('join-room', ({ user_id, room_id, privacy }, callback) => {

        // Update the room for user connected
        const { user, error } = Helper.joinRoom({
            socket_id: socket.id,
            user_id,
            room_id
        });
        if (error) {
            console.log('join error:', error);
        } else {
            console.log('join user:', user);
        }

        // Add the Room ID to the socket list
        socket.join(room_id);

        // Send room messages to the client
        Message.find({ room_id }).then(result => {
            console.log('messages history', result);
            socket.emit('get-message-history', result);
        });

        // Get public keys from chat users
        const objUserID = new mongoose.mongo.ObjectId(user_id);
        const objRoomID = new mongoose.mongo.ObjectId(room_id);
        let Room = null, localField = null;
        if (privacy === 'Private') {
            Room = PrivateRoom;
            localField = 'members';
        } else {
            Room = SharedRoom;
            localField = 'members._id';
        }
        Room.aggregate([
            { $match: { _id: objRoomID } },
            { $lookup: { from: 'users', localField: localField, foreignField: '_id', as: 'user' } },
            { $project: { _id: false, user: true } },
            { $unwind: "$user" },
            {
                $redact: {
                    $cond: {
                        if: { $eq: ["$user._id", objUserID] },
                        then: "$$PRUNE",
                        else: "$$DESCEND"
                    }
                }
            },
            {
                $group: {
                    _id: "$user._id",
                    publicKey: { $first: "$user.publicKey" }
                }
            }
        ]).then(result => {
            console.log(result);
            return callback(result);
        }).catch(error => {
            console.log(error);
        });
    });


    socket.on('send-message', (data, room_id, callback) => {
        const user = Helper.getUserBySocketID(socket.id);
        const msgData = {
            name: user.name,
            user_id: user.user_id,
            room_id,
            text: data.message,
            color: data.color
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


server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
