const jwt = require("jsonwebtoken");
const CONFIG = require("../../config/config.js");
const jwtGenerator = require("../utils/jwt.generator.js");
const { SEND_EMAIL_BY_NODEMAILER } = require("../utils/email.configuration.js");

//............check from atcivate email.........//
const sendEmail = async function (
  user,
  messagHeader,
  code = ""
) {
  const message = `${code ? `RecoveryCode: ${code}` : ""}`;
  const info = SEND_EMAIL_BY_NODEMAILER(user.email, messagHeader, message);
  return info;
};
const sendCompanyEmail = async function (
  company,
  messagHeader,
  code = ""
) {
  const message = `${code ? `RecoveryCode: ${code}` : ""}`;
  const info = SEND_EMAIL_BY_NODEMAILER(company.email, messagHeader, message);
  return info;
};

//--------------------//

module.exports = {
  sendEmail,
  sendCompanyEmail,
};
