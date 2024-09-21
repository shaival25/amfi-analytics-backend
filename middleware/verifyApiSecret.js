// verifyApiSecret.js
const config = require('../config/config');

module.exports = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    if (token !== config.apiKey) {
        return res.status(403).json({ msg: 'Invalid token, authorization denied' });
    }
    next();
};
