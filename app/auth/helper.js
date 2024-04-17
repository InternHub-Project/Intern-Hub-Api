const jwt = require("jsonwebtoken");
const CONFIG = require("../../config/config.js");
const jwtGenerator = require("../utils/jwt.generator.js");
const { SEND_EMAIL_BY_NODEMAILER } = require("../utils/email.configuration.js");
const userModel = require("../DB/models/user.Schema.js");
const companyModel = require("../DB/models/company.Schema.js");

//............check from atcivate email.........//
const sendEmail = async function (user, messagHeader, code = "") {
  const message = `${code ? `RecoveryCode: ${code}` : ""}`;
  const info = SEND_EMAIL_BY_NODEMAILER(user.email, messagHeader, message);
  return info;
};

const sendConfirmEmail = async function (req, user, routeLink, messageLink, messagHeader, code = "") {
  let tokenconfirm
  if(user.userId){
    tokenconfirm = await jwtGenerator({ userId: user.userId, TO: "user" }, 50000000, "h");
  }
  else if(user.companyId){
    tokenconfirm = await jwtGenerator({ companyId: user.companyId, TO: "company" }, 5000000, "h");
  }
  const link = `http://localhost:5173/confirmation/${tokenconfirm}`;
  const message = `<a href='${link}'>follow me to ${messageLink}</a> <br></br> ${
    code ? `RecoveryCode: ${code}` : ""
  }<br></br>`;
  const info = SEND_EMAIL_BY_NODEMAILER(user.email, messagHeader, message);
  return info;
};

const checktype=(type)=>{
  if(type=="user"){
    return  userModel
  }
  if(type=="company"){
    return companyModel
  }
}

//--------------------//

module.exports = {
  sendEmail,
  sendConfirmEmail,
  checktype
};
