const userModel = require('../db/models/user.schema')
const { sendResponse } = require('../utils/util.service');
const CONFIG = require('../../config/config');
const jwt = require('jsonwebtoken')
const constans = require('../utils/constants')
const path = require('path');
const helper = require('./helper.js');
const { v4: uuidv4 } = require("uuid");
const jwtGenerator = require('../utils/jwt.generator.js');
const tokenSchema = require('./token.schema.js');
const bcrypt = require('bcryptjs');
const { use } = require('passport');


//...........SignUp.................//
const signUp = async (req, res, next)=>{
  try {
      const {email, firstName, lastName, password} = req.body;
      const user = await userModel.findOne({email: email});
      if(!user){
          const newUser = await userModel({
              email,
              userId: "User"+uuidv4(),
              firstName,
              lastName,
              password
          });
          const confirmLink = 'confirm u account';
          const confirmMessag = "Confirmation Email Send From Intern-Hub Application";
          const info = await helper.sendEmail(req, newUser, "confirmEmail", confirmLink, confirmMessag);
          if (info) {
              const savedUser=await newUser.save();
              sendResponse(res, constans.RESPONSE_CREATED, "Done", savedUser.userId, {});
          } else {
              sendResponse(res, constans.RESPONSE_BAD_REQUEST, constans.UNHANDLED_ERROR, [], "rejected Eamil");
          }
      }
      else{
          sendResponse(res, constans.RESPONSE_BAD_REQUEST,constans.UNHANDLED_ERROR ,'', 'email already exist');
      }
  } catch (error) {
      sendResponse(res, constans.RESPONSE_BAD_REQUEST, constans.UNHANDLED_ERROR,'', error.message);
  }
};


//...........confirmation Email.............//
const confirmemail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, CONFIG.jwt_encryption);
    if (!decoded?.userId) {
      sendResponse(res, constans.UNPROCESSABLE_CONTENT, constans.UNHANDLED_ERROR, {}, "invaildToken");
    } else {
      const user = await userModel.findOneAndUpdate(
        { userId: decoded.userId, activateEmail: false },
        { activateEmail: true }
      );
      if (!user) {
        sendResponse(res, constans.RESPONSE_NOT_FOUND, constans.UNHANDLED_ERROR, {}, "email already confirmed or in-vaild token");
      } else {
        sendResponse(res, constans.RESPONSE_SUCCESS, "Confirmed Succeed", {}, []);
      }
    }
  } catch (error) {
    sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR,constans.UNHANDLED_ERROR, {}, [error.message]);
  }
};

///LOGIN///
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    //..Check if User Exists..//
    if (!user) {
      sendResponse(res, constans.RESPONSE_NOT_FOUND, "Email not found!", {}, [] );
    }
    //..Check if Email is Activated..//
    if (!user.activateEmail) {
      const confirmLink = 'confirm u account';
      const confirmMessag = "Confirmation Email Send From Intern-Hub Application";
      const result = await helper.sendEmail(req, newUser, "confirmEmail", confirmLink, confirmMessag);
      if (result) {
        sendResponse(res, constans.RESPONSE_BAD_REQUEST, "Confirm your email ... we've sent a message at your email", {}, []);
      }
    }

    //..Compare Passwords..//
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      sendResponse(res, constans.RESPONSE_NOT_FOUND, "Wrong password!", {}, []);
    }

    //..Generate Access Token..//
    const accToken = await jwtGenerator({ userId: user.userId });
    existingToken = await tokenSchema.findOne({ userId: user.userId });

    if (existingToken) {
      await tokenSchema.updateOne(
        { userId: user.userId },
        { $set: { accToken } }
      );
    } else {
      newToken = new tokenSchema({
        userId: user.userId,
        token: accToken,
      });
      await newToken.save();
    }

    // Set the access token as an HTTP-only cookie
    res.cookie("accToken", accToken, {
      httpOnly: true,
      secure: true,
    });

    sendResponse(res, constans.RESPONSE_SUCCESS, "Confirmed Succeed", {}, []);
  } catch (error) {
    sendResponse(
      res, constans.RESPONSE_INT_SERVER_ERROR, constans.UNHANDLED_ERROR, "", [error.message] );
  }
};

//----------------forgot Password----------------//
const forgotPasswordEmail = async (req, res, next)=>{
  try{
    const { email } = req.body;
    const user = await userModel.findOne({email: email});
    if(!user){
      sendResponse(res, constans.RESPONSE_BAD_REQUEST, constans.UNHANDLED_ERROR, {}, "this email is not exist");
    }else{
      const setPasswordLink = "set your password";
      const setPasswordMessag = "Set password Email Send From Intern-Hub Application";
      const info = helper.sendEmail(req, user, "setPassword", setPasswordLink, setPasswordMessag);
      if(info){
        sendResponse(res, constans.RESPONSE_SUCCESS, `we send you an email at ${helper.hashEmail(email)}`, {}, []);
      }
    }
  }catch(error){
    sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, constans.UNHANDLED_ERROR, "", [error.message]);
  }
};
//----------------set password----------------//
const setPassword = async(req, res, next)=>{
  try {
    const { token } = req.params;
    const { password } = req.body;
    const decoded = jwt.verify(token, CONFIG.jwt_encryption);
    if (!decoded?.userId) {
      sendResponse(res, constans.UNPROCESSABLE_CONTENT, constans.UNHANDLED_ERROR, {}, "invaildToken");
    } else {
      const user = await userModel.findOne({userId: decoded.userId});
      const encryptedPassword = bcrypt.hashSync(password, parseInt(CONFIG.BCRYPT_SALT));
      const set = await userModel.updateOne({userId:user.userId}, {$set:{encryptedPassword}});
      sendResponse(res, constans.RESPONSE_SUCCESS, "Set new password Succeed", set, []);
    }
  } catch (error) {
    sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, constans.UNHANDLED_ERROR, {}, [error.message]);
  }
}



module.exports = {
    signUp,
    confirmemail,
    login,
    forgotPasswordEmail,
    setPassword
}



