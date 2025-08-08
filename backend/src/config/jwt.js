
module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkeyfallback', 
    jwtExpiresIn: '1h' 
};