const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
    console.log("logged in user--", req.user);
    const auth = req.headers['authorization'];
    if (!auth) {
        return res.status(401).json({ error: 'Unauthorized, JWT token is missing' });
    }
    try {
        const decodedData = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
        req.user = decodedData;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized, invalid JWT token' });
    }
}

module.exports = ensureAuthenticated;