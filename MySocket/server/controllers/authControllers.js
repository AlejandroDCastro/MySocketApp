
// Each request to the backend is eventually executed by a controller

module.exports.signup = (req,res) => {
    res.send('signup');
}

module.exports.login = (req,res) => {
    res.send('login');
}

module.exports.logout = (req,res) => {
    res.send('logout');
}