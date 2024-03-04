const userModel = require("../DB/models/user.Schema.js");
const { sendResponse } = require("../utils/util.service.js");
const { skillsModel } = require("../utils/utils.schema.js");
const { v4: uuidv4 } = require("uuid");
const constans=require("../utils/constants.js");
const bcrypt = require("bcryptjs");
const tokenSchema = require("../auth/token.schema.js");
const CONFIG = require('../../config/config.js');
const { imageKit } = require("../utils/imagekit.js");
const applicantModel = require('../DB/models/applicant.schema.js');
const pagination = require('../utils/pagination.js')



//.........add new skills if it does not exist in skillSchema.......//
const addSkills=async(req,res,next)=>{
    try {
        const {skillName}=req.body;
        const checkSkill=await skillsModel.findOne({skillName:skillName.toLowerCase()})
        if(checkSkill){
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,constans.UNHANDLED_ERROR,'',"Skill already exist")
        }
        else{
            const {userId}=req.user;
            const skill=await skillsModel.create({
                skillName,
                skillId:"Skill"+uuidv4()
            })
            const user=await userModel.findOneAndUpdate({userId:userId},{$addToSet:{skillIDs:skill._id}},{runValidators:true})
            sendResponse(res,constans.RESPONSE_CREATED,"Done",{},[])
        }
    } catch (error) {
        sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,constans.UNHANDLED_ERROR,"",error.message);
    }
}


//.............Update user profile.................//
const updateUser=async(req,res,next)=>{
    try {
        const {userId}=req.user;
        if(req.files && req.files["image"] && req.files["image"][0]){
           const image=await imageKit.upload(
                {
                  file: req.files["image"][0].buffer.toString('base64'), //required
                  fileName: req.files["image"][0].originalname, //required,
                  folder:`internHub/${userId}`,
                  useUniqueFileName:true
                },
              );
             req.body.profileImage=image.url
        }
    
        if(req.files && req.files["file"] && req.files["file"][0]){
           const cv =await imageKit.upload(
                {
                  file:req.files["file"][0].buffer.toString('base64'), //required
                  fileName: req.files["file"][0].originalname, //required,
                  folder:`internHub/${userId}`,
                  useUniqueFileName:true
                },
              );
              req.body.cv=cv.url

        }
        
        const user=await userModel.findOneAndUpdate({userId:userId},{$set:req.body},{runValidators: true})
        sendResponse(res,constans.RESPONSE_SUCCESS,"user updated success",{user:user.userId},[])
    

    } catch (error) {
        sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,constans.UNHANDLED_ERROR,"",error.message);
    }
}

//..............soft Delete User .............//
const deleteUser = async (req, res, next)=>{
    try{
        const {userId}=req.user;
        await userModel.updateOne({userId}, {$set:{isDeleted: true}})
        sendResponse(res, constans.RESPONSE_SUCCESS, "user deleted", '', [] );
    }catch(error){
        sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,constans.UNHANDLED_ERROR,"",error.message);
    }
}


//****** changePassword *******/
const changePassword = async (req, res, next) => {
    try {

        const { userId } = req.user;
        const user=await userModel.findOne({userId})
        const { currentPassword, newPassword } = req.body;
        const isPasswordValid = bcrypt.compareSync(currentPassword,user.encryptedPassword);
        if (!isPasswordValid) {
            sendResponse(res,constans.RESPONSE_UNAUTHORIZED,"Current password is invalid",'',[]);
        } else {
            if (currentPassword === newPassword) {
                sendResponse(res,constans.RESPONSE_BAD_REQUEST,"New password must be different from the old password.",'', []);
            }
            const encryptedPassword = bcrypt.hashSync(newPassword, parseInt(CONFIG.BCRYPT_SALT));
            const updatedPassword = await userModel.updateOne({ userId },{ $set: {encryptedPassword} });
            //const updatedPassword = await userModel.updateOne({ userId },{ $set: { password: newPassword } });

            sendResponse(res,constans.RESPONSE_SUCCESS,"Password changed successfully",updatedPassword,[]);
        }
    } catch (error) {
        sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,constans.UNHANDLED_ERROR,{},[error.message]);
    }
};


//............SignOut.................//
const signOut=async(req,res,next)=>{
    try {
        res.clearCookie("token");   //.....this line for test only, frontend will remove token from cookie, we will remove it later
        await tokenSchema.findOneAndDelete({token:req.cookies.token})
        sendResponse(res,constans.RESPONSE_SUCCESS, "Sign-Out successfully", '', []);
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, constans.UNHANDLED_ERROR, '', error.message);
    }

}


const appliedjobs = async (req, res, next)=>{
    try{
        const { userId } = req.user;
        const{skip,limit}=paginate({
            page:req.query.page,
            size:req.query.size
        })
        const jobs = applicantModel.find({userId}).limit(limit).skip(skip);
        if(!jobs){
            sendResponse(res,constans.RESPONSE_NOT_FOUND,"No Job Found!",{},[])
        }else{
            sendResponse(res,constans.RESPONSE_SUCCESS,"Done",{jobs},[])
        }
    }catch(error){
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, constans.UNHANDLED_ERROR, '', error.message);
    }
}






module.exports={
    addSkills,
    updateUser,
    deleteUser,
    changePassword,
    signOut,
    appliedjobs
}
