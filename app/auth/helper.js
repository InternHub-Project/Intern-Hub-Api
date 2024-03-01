const jwt = require("jsonwebtoken");
const CONFIG = require("../../config/config.js");
const jwtGenerator = require("../utils/jwt.generator.js");
const { SEND_EMAIL_BY_NODEMAILER } = require("../utils/email.configuration.js");

//............check from atcivate email.........//
const sendEmail = async function (
  req,
  user,
  routeLink,
  messageLink,
  messagHeader,
  code = ""
) {
  const tokenconfirm = await jwtGenerator(
    { userId: user.userId, TO: "user" },
    1,
    "h"
  );
  const link = `${req.protocol}://${req.headers.host}${CONFIG.BASEURL}/${routeLink}/${tokenconfirm}`;
  const message = `<a href='${link}'>follow me to ${messageLink}</a> <br></br> ${
    code ? `RecoveryCode: ${code}` : ""
  }<br></br>`;
  const info = SEND_EMAIL_BY_NODEMAILER(user.email, messagHeader, message);
  return info;
};
const sendCompanyEmail = async function (
  req,
  company,
  routeLink,
  messageLink,
  messagHeader,
  code = ""
) {
  const tokenconfirm = await jwtGenerator(
    { companyId: company.companyId, TO: "company" },
    1,
    "h"
  );
  const link = `${req.protocol}://${req.headers.host}${CONFIG.BASEURL}/${routeLink}/${tokenconfirm}`;
  const message = `<a href='${link}'>follow me to ${messageLink}</a> <br></br> ${
    code ? `RecoveryCode: ${code}` : ""
  }<br></br>`;
  const info = SEND_EMAIL_BY_NODEMAILER(company.email, messagHeader, message);
  return info;
};

//--------------------//

module.exports = {
  sendEmail,
  sendCompanyEmail,
};
