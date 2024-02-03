const userModel = require('../../DB/models/user.Schema')
const bcrypt = require('bcryptjs');
const { sendResponse } = require('../../utils/util.service');
const CONFIG = require('../../../config/config');
const generateJwt = require('../../utils/jwtGenerator');
const constans = require('../../utils/constants')
const path = require('path');
const constants = require('../../utils/constants');
const checkEmail = require('../../utils/checkEmail');

const signUp = async (req, res, next)=>{
    try {
        const {email, fristName, lastName, password} = req.body;
        const user = await userModel.findOne({email: email});
        if(!user){
            const hashedpasseord =  await bcrypt.hash(password, parseInt(CONFIG.BCRYPT_SALT), (err, hash)=>{});
            const newUser = await userModel({
                email,
                userId: constants.specifyID(fristName),
                fristName,
                lastName,
                password: hashedpasseord,
            });
            const info = await checkEmail(req, newUser);
            if (info) {
                newUser.activateEmail = true;
                await newUser.save();
                const data = {
                    fristName,
                    lastName
                }
                sendResponse(res, constans.RESPONSE_CREATED, "Done", data, {});
            } else {
                sendResponse(res, constans.RESPONSE_BAD_REQUEST, constans.UNHANDLED_ERROR, [], "rejected Eamil");
            }
        }
        else
            sendResponse(res, constans.RESPONSE_BAD_REQUEST, 'this email is already exist','', []);
    } catch (error) {
        sendResponse(res, constans.RESPONSE_BAD_REQUEST, constans.UNHANDLED_ERROR,'', error.message);
    }

};


module.exports = {
    signUp
}



