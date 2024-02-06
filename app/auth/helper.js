const jwt = require('jsonwebtoken');
const CONFIG = require('../../config/config.js');
const jwtGenerator = require('../utils/jwt.generator.js');
const { SEND_EMAIL_BY_NODEMAILER } = require('../utils/email.configuration.js');


//............check from atcivate email.........//
const sendEmail = async function (req, user, routeLink, messageLink, messagHeader) {
    const tokenconfirm = await jwtGenerator({ userId: user.userId }, 1 , 'h'); 
    const link = `${req.protocol}://${req.headers.host}${CONFIG.BASEURL}/${routeLink}/${tokenconfirm}`;
    const message = `<a href='${link}'>follow me to ${messageLink}</a><br></br>`;
    const info = SEND_EMAIL_BY_NODEMAILER(
        user.email,
        messagHeader,
        message
    );
    return info;
};

//..............hashEmail..................//
const hashEmail = (email)=>{
    email= email.split('@');
    let x= parseInt( email[0].length/2);
    let y= email[0].length;
    email[0]= Array.from(email[0]);
    while(y-- && x--){
        email[0][y] = "*";
    }
    email[0]= email[0].join('')
    email= email.join('@')
    return email;
}

module.exports ={
    hashEmail,
    sendEmail
}

    