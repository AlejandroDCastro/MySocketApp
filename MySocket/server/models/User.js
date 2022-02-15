const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
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
    kloginHash: {
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
    this.kloginHash = CryptoJS.SHA3(this.kloginHash, { outputLength: 512 }).toString(CryptoJS.enc.Base64);
    next();
});

// Check if user exists
userSchema.statics.login = async function (email, klogin) {
    const user = await this.findOne({ email });
    if (user) {
        const kloginHash = CryptoJS.SHA3(klogin, { outputLength: 512 }).toString(CryptoJS.enc.Base64);
        if (kloginHash === user.kloginHash) return user;
        else throw Error('incorrect pwd');
    } else {
        throw Error('incorrect email');
    }
}


const User = mongoose.model('user', userSchema);
module.exports = User;