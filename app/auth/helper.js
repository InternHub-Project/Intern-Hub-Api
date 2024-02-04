const jwt = require('jsonwebtoken');
const CONFIG = require('../../config/config.js');
const { SEND_EMAIL_BY_NODEMAILER } = require('../utils/email.configuration.js');
//............check from atcivate email.........//
const checkEmail = function (req, user) {
    const tokenconfirm = jwt.sign(
        { userId: user.userId },
        CONFIG.jwt_encryption,
        {
            expiresIn: "1h",
        }
    );
    const link = `${req.protocol}://${req.headers.host}${CONFIG.BASEURL}/confirmEmail/${tokenconfirm}`;
    const message = `<a href='${link}'>follow me to confirm u account</a><br></br>`;
    const info = SEND_EMAIL_BY_NODEMAILER(
        user.email,
        "Confirmation Email Send From Intern-Hub Application",
        message
    );
    return info;
};

module.exports = checkEmail;