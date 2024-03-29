const { token } = require('morgan');
const CONFIG = require('../../config/config');

const setTokenWithCookies = (res, token)=>{
    const options = {
        domain: 'localhost',
        sameSite: 'none',
        path: '/',
        httpOnly: true,
        secure: false
    }
    return res.cookie("token", token, options);
}

module.exports = setTokenWithCookies