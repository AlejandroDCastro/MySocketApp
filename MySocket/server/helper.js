
const usersConnected = [];
const usersChatting = [];


// Users connected to the App in Home Page
const Home = {

    addUser: ({ socket_id, user_id }) => {
        const exist = usersConnected.find(user => (user.user_id === user_id));
        if (exist) {
            return { error: 'User already exist in the connection' }
        }
        const user = { socket_id, user_id };
        usersConnected.push(user);
        console.log('users connected: ', usersConnected);
        return { user };
    },

    removeUser: (socket_id) => {
        const index = usersConnected.findIndex(user => user.socket_id === socket_id);
        if (index !== -1) {
            return usersConnected.splice(index, 1)[0];
        }
    },

    getSocketID: (user_id) => {
        return usersConnected.find(user => user.user_id === user_id).socket_id;
    },

    getUserID: (socket_id) => {
        return usersConnected.find(user => user.socket_id === socket_id).user_id;
    }
}


// Users while chatting in rooms
const Chat = {

    addUser: ({ socket_id, name, user_id, room_id }) => {
        const exist = usersChatting.find(user => (user.room_id === room_id && user.user_id === user_id));
        if (exist) {
            return { error: 'User already exist in this room' }
        }
        const user = { socket_id, name, user_id, room_id };
        usersChatting.push(user);
        console.log('user list', usersChatting);
        return { user: user };
    },

    getUser: (socket_id) => usersChatting.find(user => user.socket_id === socket_id),

    removeUser: (socket_id) => {
        const index = usersChatting.findIndex(user => user.socket_id === socket_id);
        if (index !== -1) {
            return usersChatting.splice(index, 1)[0];
        }
    }

}

module.exports = { Home, Chat };