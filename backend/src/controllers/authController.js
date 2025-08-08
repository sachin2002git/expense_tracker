const User = require('../models/User'); 
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/jwt'); 


const generateToken = (id) => {
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: jwtExpiresIn, 
    });
};


const registerUser = async (req, res) => {
    const { username, email, password } = req.body; 

    console.log('Register attempt:', { username, email, password: '[HIDDEN]' }); 

   
    if (!username || !email || !password) {
        console.error('Registration Error: Missing fields');
        return res.status(400).json({ message: 'Please enter all fields: username, email, and password.' });
    }

    try {
        let user = await User.findOne({ email }); 
        if (user) {
            console.error('Registration Error: User with this email already exists');
            return res.status(400).json({ message: 'User with this email already exists' });
        }

       
        const newUser = new User({
            username,
            email,
            password, 
        });

        console.log('Attempting to save new user...');
        user = await newUser.save(); 

        if (user) {
            console.log('User registered successfully:', user.email);
          
            res.status(201).json({ 
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id), 
            });
        } else {
            console.error('Registration Error: Invalid user data provided after save attempt');
            res.status(400).json({ message: 'Invalid user data provided' });
        }
    } catch (error) {
        console.error('Registration Error (Caught in try-catch):', error.message);

        console.error('Full Error Object:', error);


        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username or Email already taken.' });
        }
        res.status(500).json({ message: 'Server error during registration. Please check server logs for details.' }); 
    }
};


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    console.log('Login attempt for:', email); 

    if (!email || !password) {
        console.error('Login Error: Missing fields');
        return res.status(400).json({ message: 'Please enter email and password.' });
    }

    try {
        const user = await User.findOne({ email }); 

        
        if (user && (await user.matchPassword(password))) {
            console.log('User logged in successfully:', user.email);
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            console.error('Login Error: Invalid email or password for', email);
            res.status(401).json({ message: 'Invalid email or password' }); 
        }
    } catch (error) {
        console.error('Login Error (Caught in try-catch):', error.message);
        console.error('Full Error Object:', error);
        res.status(500).json({ message: 'Server error during login. Please check server logs for details.' });
    }
};

module.exports = { registerUser, loginUser }; 