const User = require('../models/User');
// JSON Web Token is a compact, URL-safe means of representing claims to be transferred between two parties
const jwt = require('jsonwebtoken');
const { Home } = require('../helper');
const maxAge = 5 * 24 * 60 * 60 // seconds

const createJWT = id => {
    return jwt.sign({ id }, 'chatroom secret', {
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

// Save user connected to the App on server
const saveUserConnected = (user_id) => {
    Home.addUser({
        socket_id: '',
        user_id
    });
}

// Each request to the backend is eventually executed by a controller
module.exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = await User.create({ name, email, password });
        const token = createJWT(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ user });
        saveUserConnected(user.id);
    } catch (error) {
        let errors = alertError(error);
        res.status(400).json({ errors });
    }
}

module.exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        const token = createJWT(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ user });
        saveUserConnected(user.id);
    } catch (error) {
        let errors = alertError(error);
        res.status(400).json({ errors });
    }
}

module.exports.verifyuser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, 'chatroom secret', async (err, decodedToken) => {
            console.log('decoded token', decodedToken);
            if (err) {
                console.log(err.message);
            } else {
                let user = await User.findById(decodedToken.id);
                res.json(user);
                next();
                saveUserConnected(user.id);
            }
        });
    } else {
        next();
    }
}

module.exports.logout = (req, res) => {
    res.cookie('jwt', "", { maxAge: 1 });
    res.status(200).json({ logout: true });
}