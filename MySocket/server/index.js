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
const io = socketio(server, {
    origins: ['https://localhost:3000'],
    handlePreflightRequest: (req, res) => {
        res.writeHead(200, {
            "Access-Control-Allow-Origin": "https://localhost:3000",
            "Access-Control-Allow-Methods": "GET,POST",
            "Access-Control-Allow-Credentials": true
        });
        res.end();
    }
});
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


        // Query for private rooms of user
        const userPrivateRoomsQuery = PrivateRoom.aggregate([
            { $match: { 'members._id': objUserID } },
            { $lookup: { from: 'users', localField: 'members._id', foreignField: '_id', as: 'user' } },
            { $lookup: { from: 'messages', localField: 'message', foreignField: '_id', as: 'lastMessage' } },
            {
                $project: {
                    _id: true,
                    user: true,
                    lastMessage: true,
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
                    lastMessage: { $first: "$lastMessage.text" },
                    fileName: { $first: "$lastMessage.fileName" },
                    updatedAt: { $first: "$updatedAt" }
                }
            },
            { $sort: { updatedAt: -1 } }
        ]);

        // Query for decrypt chat keys for user
        const chatKeysQuery = PrivateRoom.aggregate([
            { $match: { 'members._id': objUserID } },
            {
                $project: {
                    _id: true,
                    members: true,
                    updatedAt: true
                }
            },
            { $unwind: "$members" },
            {
                $redact: {
                    $cond: {
                        if: { $eq: ["$members._id", objUserID] },
                        then: "$$KEEP",
                        else: "$$PRUNE"
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    chatKey: { $first: "$members.encryptedChatKey" },
                    updatedAt: { $first: "$updatedAt" }
                }
            },
            { $sort: { updatedAt: -1 } },
            {
                $project: {
                    _id: false,
                    chatKey: true
                }
            }
        ]);

        // Resolve private rooms
        Promise.all([userPrivateRoomsQuery, chatKeysQuery]).then(result => {
            console.log('private rooms', result);
            socket.emit('output-private-rooms', result);
        });


        // Query for shared rooms of user
        const userSharedRoomsQuery = SharedRoom.aggregate([
            { $match: { "members._id": objUserID } },
            { $lookup: { from: 'messages', localField: 'message', foreignField: '_id', as: 'lastMessage' } },
            { $unwind: "$members" },
            {
                $redact: {
                    $cond: {
                        if: { $eq: ["$members._id", objUserID] },
                        then: "$$KEEP",
                        else: "$$PRUNE"
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    color: { $first: "$members.color" },
                    lastMessage: { $first: "$lastMessage.text" },
                    messageAuthor: { $first: "$lastMessage.name" },
                    fileName: { $first: "$lastMessage.fileName" },
                    updatedAt: { $first: "$updatedAt" }
                }
            },
            { $sort: { updatedAt: -1 } }
        ]);


        // Query for decrypt chat keys for user
        const chatKeysQueryShared = SharedRoom.aggregate([
            { $match: { "members._id": objUserID } },
            {
                $project: {
                    _id: true,
                    members: true,
                    updatedAt: true
                }
            },
            { $unwind: "$members" },
            {
                $redact: {
                    $cond: {
                        if: { $eq: ["$members._id", objUserID] },
                        then: "$$KEEP",
                        else: "$$PRUNE"
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    chatKey: { $first: "$members.encryptedChatKey" },
                    updatedAt: { $first: "$updatedAt" }
                }
            },
            { $sort: { updatedAt: -1 } },
            {
                $project: {
                    _id: false,
                    chatKey: true
                }
            }
        ]);

        // Resolve shared rooms
        Promise.all([userSharedRoomsQuery, chatKeysQueryShared]).then(result => {
            console.log('shared rooms', result);
            socket.emit('output-shared-rooms', result);
        });
    });


    socket.on('check-correct-room', (email, callback) => {

        // Look for guest user
        User.findOne({ email }).then(guest => {
            const host = Helper.getUserBySocketID(socket.id);
            let host_id = undefined;

            // Check if user is introducing a correct email
            if (guest) {
                host_id = new mongoose.mongo.ObjectId(host.user_id);
            } else {
                throw 'The user introduced does not exists...';
            }
            if (host.user_id === guest.id) {
                throw 'You cannot talk with yourself...';
            }
            PrivateRoom.exists({
                'members._id': {
                    $all: [
                        host_id,
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
                        body: {
                            guest_id: guest.id,
                            guest_name: guest.name,
                            guest_publicKey: guest.publicKey
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
                {
                    _id: data.host.id,
                    encryptedChatKey: data.host.encryptedChatKey
                },
                {
                    _id: data.guest.id,
                    encryptedChatKey: data.guest.encryptedChatKey
                }
            ]
        });
        privateRoom.save().then(result => {

            // Emit new Room at the moment
            console.log('private room', result);
            const localPrivateRoom = [
                {
                    _id: result.id,
                    name: data.guest.name,
                    color: '000',
                    lastMessage: [],
                    updatedAt: result.updatedAt
                }, {
                    encryptedChatKey: data.host.encryptedChatKey
                }
            ];
            socket.emit('private-room-created', localPrivateRoom);

            // Check if other user is connected
            const guestConnected = Helper.getUserByID(data.guest.id);
            if (guestConnected) {
                const guestPrivateRoom = [
                    {
                        _id: result.id,
                        name: data.host.name,
                        color: '000',
                        lastMessage: [],
                        updatedAt: result.updatedAt
                    }, {
                        encryptedChatKey: data.guest.encryptedChatKey
                    }
                ];
                io.to(guestConnected.socket_id).emit('private-room-created', guestPrivateRoom);
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
                    const roomData = [
                        {
                            _id: result.id,
                            name: result.name,
                            color: member.color,
                            lastMessage: [],
                            updatedAt: result.updatedAt
                        }, {
                            encryptedChatKey: member.encryptedChatKey
                        }
                    ];
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
                        user: {
                            _id: guest._id,
                            email: guest.email,
                            name: guest.name,
                            publicKey: guest.publicKey
                        }
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
        const msgQuery = Message.find({ room_id });

        // Get encrypted room key for user
        const objUserID = new mongoose.mongo.ObjectId(user_id);
        const objRoomID = new mongoose.mongo.ObjectId(room_id);
        const Room = (privacy === 'Private') ? PrivateRoom : SharedRoom;
        const keyQuery = Room.aggregate([
            { $match: { _id: objRoomID } },
            { $unwind: "$members" },
            { $match: { 'members._id': objUserID } },
            {
                $group: {
                    _id: "$members._id",
                    encryptedChatKey: { $first: "$members.encryptedChatKey" }
                }
            }
        ]);

        // Execute them concurrently
        Promise.all([msgQuery, keyQuery]).then(result => {
            console.log(result);
            return callback({
                messages: result[0],
                encryptedChatKey: result[1][0].encryptedChatKey
            });
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
        if (data.fileName) {
            msgData.fileName = data.fileName;
        }
        console.log('message', msgData);

        // Save message
        const newMessage = new Message(msgData);
        newMessage.save().then(result => {

            // Update chat with last message
            const Room = (data.privacy === 'Private') ? PrivateRoom : SharedRoom;
            const objRoomID = new mongoose.mongo.ObjectId(room_id);
            Room.findOneAndUpdate({ '_id': objRoomID }, { $set: { 'message': result._id } }).then();

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
