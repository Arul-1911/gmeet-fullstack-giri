const jwt = require('jsonwebtoken');

//generating token
const generatetoken  = (user) => jwt.sign({id:user.id},process.env.SECRET_KEY,{expiresIn:'10m'})


module.exports = generatetoken;