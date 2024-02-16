const userModel = require("../DB/models/user.Schema.js");
const { sendResponse } = require("../utils/util.service.js");
const { skillsModel } = require("../utils/utils.schema.js");
const { v4: uuidv4 } = require("uuid");
const constans=require("../utils/constants.js");
const { cloudinary } = require("../utils/cloudnairy.js");
const bcrypt = require("bcryptjs");
const tokenSchema = require("../auth/token.schema.js");




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
      const { _id } = req.user;
      const user=await userModel.findById({_id})
      const { currentPassword, newPassword } = req.body;
      const isPasswordValid = bcrypt.compareSync(currentPassword,user.encryptedPassword);
      if (!isPasswordValid) {
        sendResponse(res,constans.RESPONSE_UNAUTHORIZED,"Current password is invalid",'',[]);
      } else {
        if (currentPassword === newPassword) {
          sendResponse(
            res,
            constans.RESPONSE_BAD_REQUEST,
            "New password must be different from the old password.",
            "",
            []
          );
        }
         const encryptedPassword = bcrypt.hashSync(
           newPassword,
           parseInt(CONFIG.BCRYPT_SALT)
         );
        const updatedPassword = await userModel.updateOne(
          { _id },
          { $set: { encryptedPassword } },
          { new: true }
        );

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






module.exports={
    addSkills,
    updateUser,
    deleteUser,
    changePassword,
    signOut
}
