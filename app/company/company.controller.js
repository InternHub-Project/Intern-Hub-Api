const { sendResponse} = require("../utils/util.service");

const CONFIG = require("../../config/config");
const jwt = require("jsonwebtoken");
const constans = require("../utils/constants");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const companyModel = require("../DB/models/company.Schema.js");



//...........SignUp.................//
const signUp = async (req, res, next) => {
    try {
        const { email, name, password } = req.body;
        const company = await companyModel.findOne({ email: email });
        if (!company) {
            const newCompany = await companyModel({
                company_email: email,
                company_name: name,
                companyId: "Company" + uuidv4(),
                password,
            });
            // const confirmLink = "confirm company account";
            // const confirmMessag = "Confirmation Email Send From Intern-Hub Application";
            // const info = await helper.sendEmail(req, newCompany, "auth/confirmEmail", confirmLink, confirmMessag);
            //if (info) {
            const savedCompany = await newCompany.save();
            sendResponse(res,constans.RESPONSE_CREATED,"Done",savedCompany.companyId,{});
            //} else {
            //    sendResponse(res,constans.RESPONSE_BAD_REQUEST,constans.UNHANDLED_ERROR,[],"rejected Eamil");
            //}
        }else{
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,constans.UNHANDLED_ERROR,"","email already exist");
        }
    } catch (error) {
        sendResponse(res,constans.RESPONSE_BAD_REQUEST,constans.UNHANDLED_ERROR,"",error.message);
    }
};


module.exports = {
    signUp
};