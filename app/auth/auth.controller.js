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
const setTokenWithCookies = require('../utils/setcookies.js');




//...........SignUp.................//
const signUp = async (req, res, next) => {
  try {
    const { email, firstName, lastName, password } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!user) {
      const newUser = await userModel({
        email,
        userId: "User" + uuidv4(),
        firstName,
        lastName,
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
        sendResponse(res,constans.RESPONSE_NOT_FOUND,"email already confirmed or in-vaild token",{},[]);
      } else {
        sendResponse(res,constans.RESPONSE_SUCCESS,"Confirmed Succeed",{},[]);
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

    setTokenWithCookies(res, accToken);
    const data = {
      userId: user.userId,
      token: accToken,
    }
    return sendResponse(res, constans.RESPONSE_SUCCESS, "Login Succeed", data, []);

  } catch (error) {
    sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
  }
};


///***** reSendcode *****///

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
  const { password, code, email,type } = req.body;
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

//............SignUp || Login with google...........//
const social_google = async (req, res, next) => {
  try {
    const { email, email_verified } = req.user._json;
    if (!email_verified) {
      sendResponse(res, constans.RESPONSE_BAD_REQUEST, "in_valid google account", {}, []);
    } else {
      const searchUser = await userModel.findOne({ email });
      //.....if findUser then user want to login......//
      if (searchUser) {
        const accToken = await jwtGenerator({ userId: searchUser.userId }, 24, "h");
        const existingToken = await tokenSchema.findOne({
          userId: searchUser.userId,
        });
        if (existingToken) {
          await tokenSchema.updateOne(
            { userId: searchUser.userId },
            { $set: { accToken } }
          );
        } else {
          newToken = new tokenSchema({
            userId: searchUser.userId,
            token: accToken,
          });
          await newToken.save();
        }
        // Set the access token as an HTTP-only cookie
        setTokenWithCookies(res, accToken);
        const data = {
          userId: searchUser.userId,
          token: accToken,
        }
        sendResponse(res, constans.RESPONSE_SUCCESS, "Login Succeed", data, []);
      }
      //.....if not user then saved  user in database.........//
      else {
        const { given_name, family_name } = req.user._json;
        const { provider } = req.user;
        const user = await userModel({
          userId: "user" + uuidv4(),
          email,
          accountType: provider,
          activateEmail: true,
          firstName: given_name,
          lastName: family_name,
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
        sendResponse(res, constans.RESPONSE_CREATED, "Done", data, []);
      }
    }
  } catch (error) {
    sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, {}, constans.UNHANDLED_ERROR);
  }
};


const social_facebook = async (req, res, next) => {
  try{
    //console.log(req.user._json);
    const { email } = req.user._json;
    if (!email) {
      sendResponse(res, constans.RESPONSE_BAD_REQUEST, "in_valid facebook account", {}, []);
    } else {
      const searchUser = await userModel.findOne({ email });
      //.....if findUser then user want to login......//
      if (searchUser) {
        const accToken = await jwtGenerator({ userId: searchUser.userId }, 24, "h");
        const existingToken = await tokenSchema.findOne({
          userId: searchUser.userId,
        });
        if (existingToken) {
          await tokenSchema.updateOne(
            { userId: searchUser.userId },
            { $set: { accToken } }
          );
        } else {
          newToken = new tokenSchema({
            userId: searchUser.userId,
            token: accToken,
          });
          await newToken.save();
        }
        // Set the access token as an HTTP-only cookie
        setTokenWithCookies(res, accToken);
        const data = {
          userId: searchUser.userId,
          token: accToken,
        }
        sendResponse(res, constans.RESPONSE_SUCCESS, "Login Succeed", data, []);
      }
      //.....if not user then saved  user in database.........//
      else {
        const { first_name, last_name } = req.user._json;
        const { provider } = req.user;
        const user = await userModel({
          userId: "user" + uuidv4(),
          email,
          accountType: provider,
          activateEmail: true,
          firstName: first_name,
          lastName: last_name,
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
        sendResponse(res, constans.RESPONSE_CREATED, "Done", data, []);
      }
    }
  }catch(error){
    sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, {}, constans.UNHANDLED_ERROR);
  }
}


//------------------------------------company-----------------------------------------//

//...........company SignUp.................//
const companySignUp = async (req, res, next) => {
  try {
      const { email, name, password, address, field } = req.body;
      const company = await companyModel.findOne({ email: email });
      if (!company) {
          const newCompany = await companyModel({
              email,
              name,
              companyId: "Company" + uuidv4(),
              password,
              address, 
              field 
          });
          const confirmLink = "confirm company account";
          const confirmMessag = "Confirmation Email Send From Intern-Hub Application";
          const info = await helper.sendConfirmEmail(req, newCompany, "auth/confirmemail", confirmLink, confirmMessag);
          if (info) {
            const savedCompany = await newCompany.save();
            sendResponse(res,constans.RESPONSE_CREATED,"Done",savedCompany.companyId,{});
          } else {
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,"rejected Eamil",[],[]);
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
    const accToken = await jwtGenerator({ companyId: company.companyId }, 24, "h");
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

    setTokenWithCookies(res, accToken);
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
const checkToken=async(req,res,next)=>{
  try {
      const authHeader= req.headers['token']
      const token=authHeader.split("internHub__")[1]
      const decoded= jwt.verify(token,CONFIG.jwt_encryption)
      const searchToken=await tokenSchema.findOne({token})
      if(searchToken){
          if (decoded.exp < Date.now() / 1000) {
              sendResponse(res,constans.RESPONSE_SUCCESS,"Done",true,[])
          }
          else{
              sendResponse(res,constans.RESPONSE_SUCCESS,"Done",false,[])
          }
      }
      else{
          sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Token does not exist or Removed",{},[])
      }
        
  } catch (error) {
      sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '',[]);
  }
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





module.exports = {
  signUp,
  confirmemail,
  login,
  setPassword,
  forgetPassword,
  social_google,
  social_facebook,
  reSendcode,
  companySignUp,
  companyLogin,
  checkToken,
  signOut
};




