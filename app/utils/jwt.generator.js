const jwt = require('jsonwebtoken');
const CONFIG = require('../../config/config');

module.exports = async (payload, expir = 1, expirType = 'h')=>{
    const token = jwt.sign(
        payload,
        CONFIG.jwt_encryption,
        {expiresIn: `${expir}${expirType}`})
    return token;
}