const mongoose = require('mongoose');
//const bcrypt = require('bcrypt');
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a name']
    },
    email: {
        type: String,
        required: [true, 'Please enter a email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email address']
    },
    klogin: {
        type: String,
        required: [true, 'Please save a login key for user']
    },
    publicKey: {
        type: String,
        required: [true, 'Please save a public key for user']
    },
    encryptedPrivateKey: {
        type: String,
        required: [true, 'Please save the cryptosystem for user private key']
    }
});

// Mongoose hook
userSchema.pre('save', async function (next) {
    //const salt = await bcrypt.genSalt();
    //this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Check if user exists
userSchema.statics.login = async function (email, password) {
    //const user = await this.findOne({ email });
    //if (user) {
    //    const isAuthenticated = await bcrypt.compare(password, user.password);
    //    if (isAuthenticated) return user;
    //    throw Error('incorrect pwd');
    //} else {
    //    throw Error('incorrect email');
    //}
}


const User = mongoose.model('user', userSchema);
module.exports = User;