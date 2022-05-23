const User = require('../models/User');
const { Helper } = require('../helper');
const jwt = require('jsonwebtoken'); // JSON Web Token is a compact, URL-safe means of representing claims to be transferred between two parties
const CryptoJS = require('crypto-js');
const NodeRSA = require('node-rsa');
const maxAge = 5 * 24 * 60 * 60 // milliseconds

const createJWT = id => {
    return jwt.sign({ id }, 'chat secret', {
        expiresIn: maxAge
    });
}

const alertError = (err) => {
    let errors = { name: '', email: '', password: '' };

    if (err.message === 'incorrect email') {
        errors.email = 'This email not found';
    }
    if (err.message === 'incorrect pwd') {
        errors.password = 'This email password is incorrect';
    }
    if (err.code === 11000) {
        errors.email = 'This email already registered';
        return errors;
    }
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}


// Each request to the backend is eventually executed by a controller
module.exports.signup = async (req, res) => {
    const { name, email, klogin, publicKey, encryptedPrivateKey } = req.body;
    try {

        // Create user and set session
        const user = await User.create({
            name,
            email,
            kloginHash: klogin,
            publicKey,
            encryptedPrivateKey
        });
        const token = createJWT(user._id);
        res.cookie('jwt', token, { httpOnly: true, secure: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user_id: user._id });
    } catch (error) {
        let errors = alertError(error);
        res.status(400).json({ errors });
    }
}

module.exports.login = async (req, res) => {
    const { email, klogin } = req.body;
    try {

        // Match login password
        const user = await User.login(email, klogin);
        user.kloginHash = '';
        const token = createJWT(user._id);
        res.cookie('jwt', token, { httpOnly: true, secure: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user });
    } catch (error) {
        let errors = alertError(error);
        res.status(400).json({ errors });
    }
}

module.exports.verifyuser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, 'chat secret', async (err, decodedToken) => {
            if (!err) {
                let user = await User.findById(decodedToken.id);
                user.kloginHash = '';
                res.json({ user });
                next();
            }
        });
    } else {
        next();
    }
}

module.exports.logout = (req, res) => {
    const token = req.cookies.jwt;

    // Delete user connected in server
    if (token) {
        const user_id = jwt.decode(token).id;
        const user = Helper.removeUserByUserID(user_id);
    }

    // Delete token with user login data from client
    res.cookie('jwt', "", { maxAge: 1 });
    res.status(200).json({ logout: true });
}