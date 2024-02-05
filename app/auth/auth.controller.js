const userModel = require("../DB/models/user.schema");
const { sendResponse } = require("../utils/util.service");
const CONFIG = require("../../config/config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const constans = require("../utils/constants");
const path = require("path");
const constants = require("../utils/constants");
const checkEmail = require("./helper.js");
const { v4: uuidv4 } = require("uuid");

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
      const info = await checkEmail(req, newUser);
      if (info) {
        const savedUser = await newUser.save();
        sendResponse(
          res,
          constans.RESPONSE_CREATED,
          "Done",
          savedUser.userId,
          {}
        );
      } else {
        sendResponse(
          res,
          constans.RESPONSE_BAD_REQUEST,
          constans.UNHANDLED_ERROR,
          [],
          "rejected Eamil"
        );
      }
    } else {
      sendResponse(
        res,
        constans.RESPONSE_BAD_REQUEST,
        constans.UNHANDLED_ERROR,
        "",
        "email already exist"
      );
    }
  } catch (error) {
    sendResponse(
      res,
      constans.RESPONSE_BAD_REQUEST,
      constans.UNHANDLED_ERROR,
      "",
      error.message
    );
  }
};

//...........confirmation Email.............//
const confirmemail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, CONFIG.jwt_encryption);
    if (!decoded?.userId) {
      sendResponse(
        res,
        constans.UNPROCESSABLE_CONTENT,
        constans.UNHANDLED_ERROR,
        {},
        "invaildToken"
      );
    } else {
      const user = await userModel.findOneAndUpdate(
        { userId: decoded.userId, activateEmail: false },
        { activateEmail: true }
      );
      if (!user) {
        sendResponse(
          res,
          constans.RESPONSE_NOT_FOUND,
          constans.UNHANDLED_ERROR,
          {},
          "email already confirmed or in-vaild token"
        );
      } else {
        sendResponse(
          res,
          constans.RESPONSE_SUCCESS,
          "Confirmed Succeed",
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
      {},
      [error.message]
    );
  }
};

///LOGIN///

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return sendResponse(
        res,
        constans.RESPONSE_NOT_FOUND,
        constans.UNHANDLED_ERROR,
        {},
        "Email not found!"
      );
    }

    //using bcrypt to compare password with encryptedPassword.
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
      const accToken = jwt.sign({ userId: user.id }, CONFIG.jwt_encryption);
      res.cookie("accToken", accToken, {
        httpOnly: true,
        secure: true,
      });
      return sendResponse(
        res,
        constans.RESPONSE_SUCCESS,
        "Confirmed Succeed",
        {},
        []
      );
    }
    if (!isPasswordCorrect) {
      return sendResponse(
        res,
        constans.RESPONSE_BAD_REQUEST,
        constans.UNHANDLED_ERROR,
        "",
        "Wrong password"
      );
    }

    //if the email was not activated ..we will use checkEmail function to send confirmation to email .
    if (user.activateEmail !== true) {
      const result = checkEmail(req, user);
      return sendResponse(res, constans.RESPONSE_SUCCESS, "Sent", result);
    }
  } catch (error) {
    return sendResponse(
      res,
      constans.RESPONSE_INT_SERVER_ERROR,
      constans.UNHANDLED_ERROR,
      "",
      [error.message]
    );
  }
};
module.exports = {
  signUp,
  confirmemail,
  login,
};
