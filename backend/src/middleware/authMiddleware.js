const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const { jwtSecret } = require('../config/jwt'); 


const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {

            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, jwtSecret);
            req.user = await User.findById(decoded.id).select('-password');
            next(); 
        } catch (error) {
            console.error(error); 
            res.status(401).json({ message: 'Not authorized, token failed or expired' }); 
        }
    }

  
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

module.exports = { protect }; 