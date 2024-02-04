const jwt = require('jsonwebtoken');
const CONFIG = require('../../config/config');

module.exports = async (payload)=>{
    const token = jwt.sign(
        payload,
        CONFIG.jwt_encryption,
        {expiresIn: '10m'})
    return token;
}