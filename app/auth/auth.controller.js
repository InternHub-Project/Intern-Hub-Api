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
      const info = await helper.sendEmail(req,newUser,"auth/confirmemail",confirmLink,confirmMessag);
      if (info) {
        const savedUser = await newUser.save();
        sendResponse(res,constans.RESPONSE_CREATED,"Done",savedUser.userId,{});
      } else {
        sendResponse(res,constans.RESPONSE_BAD_REQUEST,constans.UNHANDLED_ERROR,[],"rejected Eamil");
        }
      }else if(user && user.isDeleted){
        await userModel.updateOne({email}, {$set:{isDeleted: false}});
        sendResponse(res,constans.RESPONSE_CREATED,"Done",user.userId,{});
    }else{
      sendResponse(res,constans.RESPONSE_BAD_REQUEST,constans.UNHANDLED_ERROR,"","email already exist");
    }
  } catch (error) {
    sendResponse(res,constans.RESPONSE_BAD_REQUEST,constans.UNHANDLED_ERROR,"",error.message);
  }
};

//...........confirmation Email.............//
const confirmemail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, CONFIG.jwt_encryption);
    
    if (!decoded?.userId && !decoded?.companyId) {
      sendResponse(res,constans.RESPONSE_UNAUTHORIZED,constans.UNHANDLED_ERROR,{},"invaildToken");
    } else {
      let user = '';
      let company = '';
      if(decoded.TO === "user"){
        user = await userModel.findOneAndUpdate(
          { userId: decoded.userId, activateEmail: false },
          { activateEmail: true }
          );
        }
        if(decoded.TO === "company"){
          company = await companyModel.findOneAndUpdate(
            { companyId: decoded.companyId, activateEmail: false },
            { activateEmail: true }
            );
          }
      if (!user && !company) {
        sendResponse(res,constans.RESPONSE_NOT_FOUND,constans.UNHANDLED_ERROR,{},"email already confirmed or in-vaild token");
      } else {
        sendResponse(res,constans.RESPONSE_SUCCESS,"Confirmed Succeed",{},[]);
      }
    }
  } catch (error) {
    sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,constans.UNHANDLED_ERROR,{},error.message);
  }
};

///LOGIN///
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select('-_id -recoveryCode -recoveryCodeDate');
    //..Check if User Exists..//
    if (!user|| user.isDeleted) {
      return sendResponse(res,constans.RESPONSE_NOT_FOUND,"Email not found!",{},[]);
    }
    //..Check if Email is Activated..//
    if (!user.activateEmail) {
      const confirmLink = "confirm u account";
      const confirmMessag =
        "Confirmation Email Send From Intern-Hub Application";
      const result = await helper.sendEmail(req,user,"auth/confirmemail",confirmLink,confirmMessag);
      if (result) {
        return sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Confirm your email ... we've sent a message at your email",{},[]);
      }
    }
    //..Compare Passwords..//
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return sendResponse(res, constans.RESPONSE_NOT_FOUND, "Wrong password!", {}, []);
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
    res.cookie("token", accToken, {
      httpOnly: true,
      secure: false,
    });
    // this line for exclude encryptedPassword  __v, activateEmail, _id, recoveryCode, recoveryCodeDate from user
    const { encryptedPassword, __v, activateEmail, _id, recoveryCode, recoveryCodeDate, ...rest } = user._doc;
    return sendResponse(res, constans.RESPONSE_SUCCESS, "Login Succeed", rest, []);
  } catch (error) {
    sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,constans.UNHANDLED_ERROR,"",error.message);
  }
};

//----------------forgot Password----------------//
const forgotPasswordEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!user|| user.isDeleted) {
      sendResponse(res, constans.RESPONSE_BAD_REQUEST, constans.UNHANDLED_ERROR, {}, "this email is not exist");
    } else {
      const code = Math.floor(10000 + Math.random() * 90000);
      const setPasswordMessag = "Set password Email Send From Intern-Hub Application";
      const info = helper.sendEmail(user,setPasswordMessag,code);
      if (info) {
        await userModel.updateOne(
          { email },
          { $set: { recoveryCode: code, recoveryCodeDate: Date.now() } }
        );
        sendResponse(res,constans.RESPONSE_SUCCESS,`we send you an email at ${email}`,{},[]);
      }
    }
  } catch (error) {
    sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,constans.UNHANDLED_ERROR,"",error.message);
  }
};

//----------------set password----------------//
const setPassword = async (req, res, next) => {
  try {
    const { password, code, email } = req.body;
    const user = await userModel.findOne({ email });
    if (
      user.recoveryCode === code &&validateExpiry(user.recoveryCodeDate) && code) {
      const encryptedPassword = bcrypt.hashSync(password, parseInt(CONFIG.BCRYPT_SALT));
      const set = await userModel.updateOne(
        { userId: user.userId },
        { $set: { encryptedPassword, recoveryCode: "" } }
      );
      sendResponse(res, constans.RESPONSE_SUCCESS, "Set new password Succeed", set, []);
    } else {
      sendResponse(res, constans.RESPONSE_BAD_REQUEST, "This code is not correct", "", []);
    }
  } catch (error) {
    sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, constans.UNHANDLED_ERROR, {}, [error.message]);
  }
};

///***** reSendcode *****///

const reSendcode = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email: email });

    if (!user|| user.isDeleted) {
      sendResponse(
        res,
        constans.RESPONSE_BAD_REQUEST,
        constans.UNHANDLED_ERROR,
        {},
        "This email does not exist"
      );
    } else {
      const code = Math.floor(10000 + Math.random() * 90000);
      const setResendCodeLink = `Resend Code`;
      const setResendCodeMessage = "a recovery code from Intern-Hub";

      const info = helper.sendEmail(
        req,
        user,
        "recovery code",
        setResendCodeLink,
        setResendCodeMessage,
        code
      );

      if (info) {
        await userModel.updateOne(
          { email },
          { $set: { recoveryCode: code, recoveryCodeDate: Date.now() } }
        );
        sendResponse(
          res,
          constans.RESPONSE_SUCCESS,
          `Recovery code resent to ${email}`,
          {},
          []
        );
      }
    }
  } catch (error) {
    sendResponse(
      res,
      constans.RESPONSE_INT_SERVER_ERROR,
      constans.UNHANDLED_ERROR,
      "",
      [error.message]
    );
  }
};

//............SignUp || Login with google...........//
const social_google = async (req, res, next) => {
  try {
    const { email, email_verified } = req.user._json;
    if (!email_verified) {
      sendResponse(
        res,
        constans.RESPONSE_BAD_REQUEST,
        constans.UNHANDLED_ERROR,
        {},
        "in_valid google account"
      );
    } else {
      const searchUser = await userModel.findOne({ email });
      //.....if findUser then user want to login......//
      if (searchUser) {
        const accToken = await jwtGenerator(
          { userId: searchUser.userId },
          24,
          "h"
        );
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
        res.cookie("token", accToken, {
          httpOnly: true,
          secure: true,
        });
        sendResponse(res, constans.RESPONSE_SUCCESS, "Login Succeed", {}, []);
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
        const signupToken = await jwtGenerator(
          { userId: savedUser.userId },
          24,
          "h"
        );
        res.cookie("token", signupToken, {
          httpOnly: true,
          secure: true,
        });
        const token = new tokenSchema({
          userId: savedUser.userId,
          token: signupToken,
        });
        await token.save();
        sendResponse(res, constans.RESPONSE_CREATED, "Done", {}, []);
      }
    }
  } catch (error) {
    sendResponse(
      res,
      constans.RESPONSE_INT_SERVER_ERROR,
      constans.UNHANDLED_ERROR,
      {},
      [error.message]
    );
  }
};


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
          const info = await helper.sendCompanyEmail(req, newCompany, "auth/confirmemail", confirmLink, confirmMessag);
          if (info) {
            const savedCompany = await newCompany.save();
            sendResponse(res,constans.RESPONSE_CREATED,"Done",savedCompany.companyId,{});
          } else {
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,constans.UNHANDLED_ERROR,[],"rejected Eamil");
          }
      }else{
          sendResponse(res,constans.RESPONSE_BAD_REQUEST,constans.UNHANDLED_ERROR,"","email already exist");
      }
  } catch (error) {
      sendResponse(res,constans.RESPONSE_BAD_REQUEST,constans.UNHANDLED_ERROR,"",error.message);
  }
};

//-------------------companyLogin---------------------//
const companyLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const company = await companyModel.findOne({ email });
    //..Check if company Exists..//
    if (!company) {
      return sendResponse(res,constans.RESPONSE_NOT_FOUND,"Email not found!",{},[]);
    }
    //..Check if Email is Activated..//
    if (!company.activateEmail) {
      const confirmLink = "confirm u account";
      const confirmMessag =
        "Confirmation Email Send From Intern-Hub Application";
      const result = await helper.sendCompanyEmail(req,company,"auth/confirmemail",confirmLink,confirmMessag);
      if (result) {
        return sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Confirm your email ... we've sent a message at your email",{},[]);
      }
    }
    //..Compare Passwords..//
    const isPasswordCorrect = await bcrypt.compare(password, company.password);
    if (!isPasswordCorrect) {
      return sendResponse(res, constans.RESPONSE_NOT_FOUND, "Wrong password!", {}, []);
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
    res.cookie("token", accToken, {
      httpOnly: true,
      secure: false,
    });
    // this line for exclude encryptedPassword  __v, activateEmail, _id, recoveryCode, recoveryCodeDate from company
    const { encryptedPassword, __v, activateEmail, _id, recoveryCode, recoveryCodeDate, ...rest } = company._doc;
    return sendResponse(res, constans.RESPONSE_SUCCESS, "Login Succeed", rest, []);
  } catch (error) {
    sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,constans.UNHANDLED_ERROR,"",error.message);
  }
};

///***** forget Company Password *****///
const forgetCompanyPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const company = await companyModel.findOne({ email: email });
    if (!company) {
      sendResponse(res, constans.RESPONSE_BAD_REQUEST, constans.UNHANDLED_ERROR, {}, "this email does not exist");
    } else {
      const code = Math.floor(10000 + Math.random() * 90000);
      const setPasswordMessag = "an update password email was sent from Intern-Hub";
      const info = helper.sendCompanyEmail(company, setPasswordMessag, code); 
      if (info) {
        await companyModel.updateOne(
          { email },
          { $set: { recoveryCode: code, recoveryCodeDate: Date.now() } }
        );
        sendResponse(res, constans.RESPONSE_SUCCESS, `we sent you an email at ${email}`, {}, []);
      }
    }
  } catch (error) {
    sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, constans.UNHANDLED_ERROR, "", error.message);
  }
};

///***** update Company Password *****///
const updateCompanyPassword = async (req, res, next) => {
  try {
    const { password, code, email } = req.body;
    const company = await companyModel.findOne({ email });
    if (company.recoveryCode === code && validateExpiry(company.recoveryCodeDate) && code) {
      const encryptedPassword = bcrypt.hashSync(password, parseInt(CONFIG.BCRYPT_SALT));
      const set = await companyModel.updateOne(
        { companyId: company.companyId },
        { $set: { encryptedPassword, recoveryCode: "" } }
      );
      sendResponse(res, constans.RESPONSE_SUCCESS, "Set new password successful", set, []);
    } else {
      sendResponse( res, constans.RESPONSE_BAD_REQUEST, "Invalid or expired code", "", []);
    }
  } catch (error) {
    sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, constans.UNHANDLED_ERROR, {}, [error.message]);
  }
};


module.exports = {
  signUp,
  confirmemail,
  login,
  forgotPasswordEmail,
  setPassword,
  social_google,
  reSendcode,
  companySignUp,
  companyLogin,
  forgetCompanyPassword,
  updateCompanyPassword
}; 
