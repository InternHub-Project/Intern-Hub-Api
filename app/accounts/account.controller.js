const { sendResponse } = require("../utils/util.service.js");
const constans=require("../utils/constants");
const userModel = require("../DB/models/user.Schema.js");
const companyModel = require("../DB/models/company.Schema.js");
const tokenSchema = require("../auth/token.schema.js");
const CONFIG = require("../../config/config.js");
const bcrypt = require("bcryptjs");








//..............soft Delete User .............//
const deleteAccount = async (req, res, next)=>{
    try{
        const {role}=req.user;
        if(role=="user"){
            const {userId}=req.user;
            const token=req.headers.authorization.split("internHub__")[1]
            await userModel.updateOne({userId}, {$set:{isDeleted: true}})
            await tokenSchema.deleteOne({token})
        sendResponse(res, constans.RESPONSE_SUCCESS, "account is  deleted", '', [] );
        }
        else if(role=="company")
        {
            const token=req.headers.authorization.split("internHub__")[1]
            await companyModel.updateOne({companyId}, {$set:{isDeleted: true}})
            await tokenSchema.deleteOne({token})
        sendResponse(res, constans.RESPONSE_SUCCESS, "account is  deleted", '', [] );
        }
        else{
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,"role  not found" ,'',[])
        }
    }catch(error){
           sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,error.message,"", constans.UNHANDLED_ERROR);
    }
}


//............change account password.............//
const changePassword = async (req, res, next) => {
    try {
        const role= req.user.role;
        if(role=="user"){
            passwordChangeFun(req,res, 'user')
        }
        else if(role=="company"){
        passwordChangeFun(req,res,"company")
        }
        else{
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,"role is not valid",[],{})
        }
    } catch (error) {
            sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,error.message,"", constans.UNHANDLED_ERROR);
    }
};


//.............helper function for changing passsword...........//
const passwordChangeFun=async(req,res,role)=>{
    let model,userOrCompanyId,companyOrUser,id;
    role=="user"?(model=userModel,userOrCompanyId="userId"):(model=companyModel,userOrCompanyId="companyId");
    id  = req.user[userOrCompanyId];
    companyOrUser = await model.findOne({ [userOrCompanyId]: id }); 
    const { currentPassword, newPassword } = req.body;
    const isPasswordValid = bcrypt.compareSync(currentPassword,companyOrUser.encryptedPassword);
    if (!isPasswordValid) {
        return sendResponse(res,constans.RESPONSE_UNAUTHORIZED,"Current password is invalid",'',[]);
    } else {
        if (currentPassword === newPassword) {
           return sendResponse(res,constans.RESPONSE_BAD_REQUEST,"New password must be different from the old password.",'', []);
        }
        const encryptedPassword = bcrypt.hashSync(newPassword, parseInt(CONFIG.BCRYPT_SALT));
        const updatedPassword = await model.updateOne({ [userOrCompanyId]: id },{ $set: {encryptedPassword} });
        return sendResponse(res,constans.RESPONSE_SUCCESS,"Password changed successfully",updatedPassword,[]);
    }

}














module.exports={
    deleteAccount,
    changePassword
}