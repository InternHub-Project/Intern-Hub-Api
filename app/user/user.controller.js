const userModel = require("../DB/models/user.Schema.js");
const { sendResponse } = require("../utils/util.service.js");
const { skillsModel } = require("../utils/utils.schema.js");
const { v4: uuidv4 } = require("uuid");
const constans=require("../utils/constants.js");
const { cloudinary } = require("../utils/cloudnairy.js");




//.........add new skills if it does not exist in skillSchema.......//
const addSkills=async(req,res,next)=>{
    try {
        const {skillName}=req.body;
        const checkSkill=await skillsModel.findOne({skillName:skillName.toLowerCase()})
        if(checkSkill){
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,constans.UNHANDLED_ERROR,{},"Skill already exist")
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
        sendResponse(
            res,
            constans.RESPONSE_INT_SERVER_ERROR,
            constans.UNHANDLED_ERROR,
            "",
            error.message
          );
    }
}


//..........Update user profile..............//
const updateUser=async(req,res,next)=>{
    try {
        const {userId}=req.user;
        // const {gender,birthdate,experienceYears,educationLevel,college,interests,gruduationDate,skillIDs,phone,address}=req.body
        // const updateFields = {gender,birthdate,experienceYears,educationLevel,college,interests,gruduationDate,skillIDs,phone,address};
        let profileImage,cv;
        if(req.files.length){
        if(req.files["image"][0]){
            const {secure_url}=await cloudinary.v2.uploader.upload(req.files["image"][0].path,{
                resource_type: 'image',
                folder:`internHub/${req.user._id}`
            })
            profileImage=secure_url
        }
        if(req.files["file"][0]){
            const {secure_url}=await cloudinary.v2.uploader.upload(req.files["file"][0].path,{
                resource_type: 'raw',
                folder:`internHub/${req.user._id}`,
            })
            cv=secure_url
        }
        }
        // Object.keys(updateFields).forEach(key=>{
        //     if (updateFields[key]) {
        //         req.body[key] = updateFields[key];
        //     }
        // })
        const user=await userModel.findOneAndUpdate({userId:userId},{$set:req.body},{runValidators: true})
           sendResponse(res,constans.RESPONSE_SUCCESS,"user updated success",{user:user.userId},[])
        } catch (error) {
        sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,constans.UNHANDLED_ERROR,"",error.message);
    }
}







module.exports={
    addSkills,
    updateUser
}