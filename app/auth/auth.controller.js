const userModel = require("../DB/models/user.schema");
const tokenSchema = require("./token.schema.js");
const { sendResponse } = require("../utils/util.service");
const CONFIG = require("../../config/config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const constans = require("../utils/constants");
const path = require("path");
const constants = require("../utils/constants");
const checkEmail = require("./helper.js");
const jwtGenerator = require("../utils/jwt.generator.js");
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
    const user = await userModel.findOne({ email });

    //..Check if User Exists..//
    if (!user) {
      sendResponse(
        res,
        constans.RESPONSE_NOT_FOUND,
        "Email not found!",
        {},
        []
      );
    }
    //..Check if Email is Activated..//
    if (!user.activateEmail) {
      const result = checkEmail(req, user);
      if (result) {
        sendResponse(
          res,
          constans.RESPONSE_BAD_REQUEST,
          "Confirm your email ... we've sent a message at your email",
          {},
          []
        );
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
