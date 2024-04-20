const { sendResponse, validateExpiry } = require("../utils/util.service");
const CONFIG = require("../../config/config");
const jwt = require("jsonwebtoken");
const constans = require("../utils/constants");
const path = require("path");
const helper = require("./helper.js");
const { v4: uuidv4 } = require("uuid");
const jwtGenerator = require("../utils/jwt.generator.js");
const tokenSchema = require("./token.schema.js");
const bcrypt = require("bcryptjs");
const userModel = require("../DB/models/user.Schema.js");
const companyModel = require("../DB/models/company.Schema.js");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CONFIG.GOOGLE_CLIENT_ID);

// const setTokenWithCookies = require('../utils/setcookies.js');




//...........SignUp.................//
const signUp = async (req, res, next) => {
  try {
    const { email, userName, password } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!user) {
      const newUser = await userModel({
        email,
        userId: "User" + uuidv4(),
        userName,
        password,
      });
      const confirmLink = "confirm u account";
      const confirmMessag =
        "Confirmation Email Send From Intern-Hub Application";
      const info = await helper.sendConfirmEmail(req,newUser,"auth/confirmemail",confirmLink,confirmMessag);
      if (info) {
        const savedUser = await newUser.save();
        sendResponse(res,constans.RESPONSE_CREATED,"Done",savedUser.userId,{});
      } else {
        sendResponse(res,constans.RESPONSE_BAD_REQUEST,"rejected Eamil", [], []);
      }
    }else if(user && user.isDeleted){
      await userModel.updateOne({email}, {$set:{isDeleted: false}});
      sendResponse(res,constans.RESPONSE_CREATED,"Done",user.userId,{});
    }else{
      sendResponse(res,constans.RESPONSE_BAD_REQUEST,"email already exist", "" , []);
    }
  } catch (error) {
    sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
  }
};

//...........confirmation Email.............//
const confirmemail = async (req, res, next) => {
  try {

      const { token } = req.params;
      const decoded = jwt.verify(token, CONFIG.jwt_encryption);
      if (!decoded?.userId && !decoded?.companyId) {
        sendResponse(res,constans.RESPONSE_UNAUTHORIZED,"invaildToken",{},[]);
      } else {
        let user = '';
        let company = '';
        const type=decoded.TO;
          if(decoded.TO === "user"){
            user = await userModel.findOneAndUpdate(
              { userId: decoded.userId, activateEmail: false },
              { activateEmail: true }
            );
          }
          else if(decoded.TO === "company"){
              company = await companyModel.findOneAndUpdate(
                { companyId: decoded.companyId, activateEmail: false },
                { activateEmail: true }
                );
            }
        if (!user && !company) {
          sendResponse(res,constans.RESPONSE_BAD_REQUEST,"email already confirmed or in-vaild token",type,[]);
        } else {
          sendResponse(res,constans.RESPONSE_SUCCESS,"Confirmed Succeed",type,[]);
        }
      }
    
   
  } catch (error) {
    sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
  }
};

///LOGIN///
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    //..Check if User Exists..//
    if (!user|| user.isDeleted) {
      return sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Email not found!",{},[]);
    }
    //..Compare Passwords..//
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return sendResponse(res, constans.RESPONSE_BAD_REQUEST, "Wrong password!", {}, []);
    }
    //..Check if Email is Activated..//
    if (!user.activateEmail) {
      const confirmLink = "confirm u account";
      const confirmMessag = "Confirmation Email Send From Intern-Hub Application";
      const result = await helper.sendConfirmEmail(req,user,"auth/confirmemail",confirmLink,confirmMessag);
      if (result) {
        return sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Confirm your email ... we've sent a message at your email",{},[]);
      }
    }
    //..Generate Access Token..//
    const accToken = await jwtGenerator({ userId: user.userId,role:"user" }, 24, "h");
    existingToken = await tokenSchema.findOne({ userId: user.userId });
    if (existingToken) {
      await tokenSchema.updateOne(
        { userId: user.userId },
        { $set: {token: accToken } }
      );
    } else {
      newToken = new tokenSchema({
        userId: user.userId,
        token: accToken,
      });
      await newToken.save();
    }

    // setTokenWithCookies(res, accToken);
    const data = {
      userId: user.userId,
      token: accToken,
    }
    return sendResponse(res, constans.RESPONSE_SUCCESS, "Login Succeed", data, []);

  } catch (error) {
    sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
  }
};


///***** reSendcode  for user and company *****///

const reSendcode = async (req, res, next) => {
  try {
    const { email,type } = req.body;
    let userOrcompamy;
    const model=helper.checktype(type)
    if(!model){
      return sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Invalid account type",{},[])
    }
    userOrcompamy = await model.findOne({ email: email });
    if (!userOrcompamy|| userOrcompamy.isDeleted) {
      sendResponse(res, constans.RESPONSE_BAD_REQUEST, "This email does not exist", {}, []);
    } else {
      const code = Math.floor(10000 + Math.random() * 90000);
      const info = helper.sendEmail( userOrcompamy, "recovery code", code);
      if (info) {
        await userModel.updateOne(
          { email },
          { $set: { recoveryCode: code, recoveryCodeDate: Date.now() } }
        );
        sendResponse(res, constans.RESPONSE_SUCCESS, `Recovery code resent to ${email}`, {}, [] );
      }
    }
  } catch (error) {
    sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
  }
};

//..............forgetPassword for user and company...................//
const forgetPassword = async (req, res, next) => {
  try {
    const {email,type} = req.body;
    let userOrcompamy;
    const model=helper.checktype(type)
    if(!model){
      return sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Invalid account type",{},[])
    }
    userOrcompamy = await model.findOne({ email: email });
    if (!userOrcompamy || userOrcompamy.isDeleted) {
      sendResponse(res, constans.RESPONSE_BAD_REQUEST, "This email does not exist", {}, []);
    } else {
              if(userOrcompamy.accountType!="system"){
          return sendResponse(res,constans.RESPONSE_BAD_REQUEST,"google auth",{},[])
        }
      const code = Math.floor(10000 + Math.random() * 90000);
      const setPasswordMessag = "an update password email was sent from Intern-Hub";
      const info = helper.sendEmail(userOrcompamy, setPasswordMessag, code); 
      if (info) {
        await model.updateOne(
          { email },
          { $set: { recoveryCode: code, recoveryCodeDate: Date.now() } }
        );
        sendResponse(res, constans.RESPONSE_SUCCESS, `we sent you an email at ${email}`, {}, []);
      }
    }
  } catch (error) {
    sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
  }
};

//..............updatePassword for user and company...................//
const setPassword = async (req, res, next) => {
  try {
    const { password, code, email, type } = req.body;
    let model=helper.checktype(type)
    if(!model){
      return sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Invalid account type",{},[])
    }
    let userOrcompamyId = (model === userModel) ? "userId" : "companyId";
    const  userOrcompamy = await userModel.findOne({ email });
    if (userOrcompamy.recoveryCode === code && validateExpiry(userOrcompamy.recoveryCodeDate) && code) {
      const encryptedPassword = bcrypt.hashSync(password, parseInt(CONFIG.BCRYPT_SALT));
          await model.updateOne(
        { [userOrcompamyId]: userOrcompamy[userOrcompamyId] },
        { $set: { recoveryCode: "",encryptedPassword } }
      );
      sendResponse(res, constans.RESPONSE_SUCCESS, "Set new password successful", {}, []);
    } else {
      sendResponse( res, constans.RESPONSE_BAD_REQUEST, "Invalid or expired code", "", []);
    }
  } catch (error) {
    sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);;
  }
};




//------------------------------------company-----------------------------------------//

//...........company SignUp.................//
const companySignUp = async (req, res, next) => {
  try {
      const { email, name, password, address,city,country,state, field } = req.body;
      const company = await companyModel.findOne({ email: email });
      if (!company) {

          const newCompany = await companyModel({
              email,
              name,
              companyId: "Company" + uuidv4(),
              password,
              address:{
                address:address,
                city:city,
                country:country,
                state:state,
              },
              field 
          });
          const confirmLink = "confirm company account";
          const confirmMessag = "Confirmation Email Send From Intern-Hub Application";
          const info = await helper.sendConfirmEmail(req, newCompany, "auth/confirmemail", confirmLink, confirmMessag);
          if (info) {
            const savedCompany = await newCompany.save();
            sendResponse(res,constans.RESPONSE_CREATED,"Done",savedCompany.companyId,[]);
          } else {
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,"rejected Eamil","",[]);
          }
      }else{
          sendResponse(res,constans.RESPONSE_BAD_REQUEST,"email already exist","",[]);
      }
  } catch (error) {
      sendResponse(res,constans.RESPONSE_BAD_REQUEST,error.message,"",constans.UNHANDLED_ERROR);
  }
};

//-------------------companyLogin---------------------//
const companyLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const company = await companyModel.findOne({ email });
    //..Check if company Exists..//
    if (!company) {
      return sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Email not found!",{},[]);
    }
    //..Compare Passwords..//
    const isPasswordCorrect = await bcrypt.compare(password, company.password);
    if (!isPasswordCorrect) {
      return sendResponse(res, constans.RESPONSE_BAD_REQUEST, "Wrong password!", {}, []);
    }
    //..Check if Email is Activated..//
    if (!company.activateEmail) {
      const confirmLink = "confirm u account";
      const confirmMessag = "Confirmation Email Send From Intern-Hub Application";
      const result = await helper.sendConfirmEmail(req,company,"auth/confirmemail",confirmLink,confirmMessag);
      if (result) {
        return sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Confirm your email ... we've sent a message at your email",{},[]);
      }
    }
    //..Generate Access Token..//
    const accToken = await jwtGenerator({ companyId: company.companyId,role:"company" }, 24, "h");
    existingToken = await tokenSchema.findOne({ companyId: company.companyId });
    if (existingToken) {
      await tokenSchema.updateOne(
        { companyId: company.companyId },
        { $set: {token: accToken } }
      );
    } else {
      newToken = new tokenSchema({
        companyId: company.companyId,
        token: accToken,
      });
      await newToken.save();
    }
    // Set the access token as an HTTP-only cookie

    // setTokenWithCookies(res, accToken);
    const data = {
      companyId: company.companyId,
      token: accToken,
    }
    sendResponse(res, constans.RESPONSE_SUCCESS, "Login Succeed", data, []);

  } catch (error) {
    sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
  }
};


//..................IS token valid....................//
const checkToken = async (req, res, next) => {
      function extractToken() {
        const token = req.headers['Authorization'] ?? req.headers['authorization'];
        if (token) {
            return token.split("internHub__")[1];
        }
    }
    const token = extractToken();
    if (!token) {
        return sendResponse(res, constans.RESPONSE_BAD_REQUEST, "Token is required", false, []);
    }
    try {
        jwt.verify(token, CONFIG.jwt_encryption);
    } catch (error) {
        return sendResponse(res, constans.RESPONSE_SUCCESS, "Token is invalid", false, []);
    }

    if (!await tokenSchema.findOne({ token })) {
        return sendResponse(res, constans.RESPONSE_BAD_REQUEST, "Token does not exist or Removed", false, []);
    }

    sendResponse(res, constans.RESPONSE_SUCCESS, "Done", true, []);
}

//..................logout............................//
const signOut=async(req,res,next)=>{ 
  try {
      if(req.headers["Authorization"]||req.headers["authorization"]){
          const token =req.headers["Authorization"] || req.headers["authorization"].split("internHub__")[1];
          const deletetoken=await tokenSchema.findOneAndDelete({token:token})
      if(deletetoken){
          delete req.headers['Authorization']||req.headers['authorization']
          sendResponse(res,constans.RESPONSE_SUCCESS, "Sign-Out successfully", '', []);
      }
      else{
          sendResponse(res,constans.RESPONSE_UNAUTHORIZED, "Unauthorized", '', []);
      }
      }
      else{
          await tokenSchema.findOneAndDelete({token:req.cookies.token})
          res.clearCookie("token");   
          sendResponse(res,constans.RESPONSE_SUCCESS, "Sign-Out successfully", '', []);
      }
  } catch (error) {
      sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,error.message,"", constans.UNHANDLED_ERROR);
  }

}


//.............signup && login with google...............//
const googleLogin=async(req,res,next)=>{
  const token = req.body.accessToken;
  if (!token) {
    return sendResponse(res,constans.RESPONSE_UNAUTHORIZED,"Missing access token",{},[])
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CONFIG.GOOGLE_CLIENT_ID, // Important: Set the audience to your Client ID
    });
    const payload = ticket.getPayload();
    if(!payload. email_verified){
      sendResponse(res,constans.RESPONSE_BAD_REQUEST,"in-valid google Account",{},[])
    }
    else{
      const searchEmail=await userModel.findOne({email:payload.email})
      if(searchEmail.accountType=="system"){
        return sendResponse(res,constans.RESPONSE_BAD_REQUEST,"plese login with Tradinal Way",{},[])
      }
      if(searchEmail){
        const accToken = await jwtGenerator({ userId: searchEmail.userId }, 24, "h");
        const existingToken = await tokenSchema.findOne({
          userId: searchEmail.userId,
        });
        console.log("oneeeeeeeee");
        if (existingToken) {
          await tokenSchema.updateOne(
            { userId: searchEmail.userId },
            { $set: { accToken } }
          );
          console.log("twwwwwwwwwwwwwo");
        } else {
          newToken = new tokenSchema({
            userId: searchEmail.userId,
            token: accToken,
          });
          await newToken.save();
        }
        const data = {
          userId: searchEmail.userId,
          token: accToken,
        }
        sendResponse(res, constans.RESPONSE_SUCCESS, "Successfully logged in with Google", data, []);
      }
      else{
        const user = await userModel({
          userId: "user" + uuidv4(),
          email:payload.email,
          accountType: "google",
          activateEmail: true,
          userName: payload.name,
          profileImage: payload.picture,
          password:CONFIG.DUMMY_PASSWORD
        });
        const savedUser = await user.save();
        const signupToken = await jwtGenerator({ userId: savedUser.userId }, 24, "h");
        setTokenWithCookies(res, signupToken);
        const token = new tokenSchema({
          userId: savedUser.userId,
          token: signupToken,
        });
        await token.save();
        const data = {
          userId: user.userId,
          token: signupToken,
        }
        sendResponse(res, constans.RESPONSE_CREATED, "Successfully logged in with Google", data, []);
      }
    }
  } catch (error) {
    sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, {}, constans.UNHANDLED_ERROR);
  }
}


module.exports = {
  signUp,
  confirmemail,
  login,
  setPassword,
  forgetPassword,
  reSendcode,
  companySignUp,
  companyLogin,
  checkToken,
  signOut,
  googleLogin
};




