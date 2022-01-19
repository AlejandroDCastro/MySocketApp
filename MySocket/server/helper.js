
const users = [];

const Helper = {

    addUser: ({ socket_id, name, user_id, room_id }) => {
        const oldUserIndex = users.findIndex(user => (user.user_id === user_id));
        if (oldUserIndex !== -1) {
            users[oldUserIndex].socket_id = socket_id;
            users[oldUserIndex].room_id = '';
            return { error: 'User already exist...' }
        } else {
            const user = { socket_id, name, user_id, room_id };
            users.push(user);
            console.log('user list', users);
            return user;
        }
    },

    getUserBySocketID: (socket_id) => users.find(user => user.socket_id === socket_id),

    getUserByID: (user_id) => {
        return users.find(user => user.user_id === user_id);
    },

    removeUserBySocketID: (socket_id) => {
        const userIndex = users.findIndex(user => user.socket_id === socket_id);
        if (userIndex !== -1) {
            return users.splice(userIndex, 1)[0];
        }
    },

    removeUserByUserID: (user_id) => {
        const userIndex = users.findIndex(user => user.user_id === user_id);
        if (userIndex !== -1) {
            return users.splice(userIndex, 1)[0];
        }
    },

    joinRoom: (user_id, room_id) => {
        const userIndex = users.findIndex(user => user.user_id === user_id);
        if (userIndex !== -1) {
            users[userIndex].room_id = room_id;
            return users[userIndex];
        }
    }

}

module.exports = { Helper };