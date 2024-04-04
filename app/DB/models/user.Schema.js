const   mongoose = require('mongoose');
const Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');
const {AddressSchema} = require('../../utils/utils.schema.js');
const CONFIG = require('../../../config/config.js');

const userSchema = new mongoose.Schema(
    {
        userId: String,
        email: {
            type:String,
            required:true
        },
        encryptedPassword: {
            type:String,
        },
        firstName: String,
        lastName: String,
        birthdate: Date,
        gender:{
            type: String,
            enum: ['male', 'female',"none"],
            defult:"none"
        },
        address: AddressSchema,
        // skillIDs:[{type:Schema.Types.ObjectId,ref:"Skill"}],
        skills: {
            type: [String],
            validate: [arrayLimit, 'MaxNumber of skills: 30'], // Custom error message
        },
        cv:String,
        phone: String,
        profileImage: String,
        experienceYears: Number,
        educationLevel: String,
        college: String,
        fieldOfInterest: [String],
        gruduationDate: String,
        bio:String,
        activateEmail: {
            type: Boolean,
            default: false,
        },
        recoveryCode: String,
        recoveryCodeDate: Date,
        accountType:{
            type:String,
            default:"system",
            enum:["system", "google", "facebook"]
        },
        isDeleted:{
            type:Boolean,
            default:false
        },
        platform:{
            type:String,
            enum:["website","mobileApp"]
        }
     
    },
    {
        timestamps: true
    }
);

userSchema.virtual("userJobs" /* any name you want */, {
    ref:"Applicant",            //->refer to Company model
    localField:"userId",   //->specifies the field in the current schema that contains the value to match against the foreignField.
    foreignField:"userId"  //->specifies the field in  (Company schema) that should match the value of the localField.
})
// userSchema.virtual("skillsdata",{
//     ref:"Skill",
//     localField:"skillIDs",
//     foreignField:"skillId"
// })


userSchema.virtual("password").set(function(password){
    this.encryptedPassword=bcrypt.hashSync(password,parseInt(CONFIG.BCRYPT_SALT))
})
.get(function(){
    return this.encryptedPassword
})
function arrayLimit(val) {
    return val.length <= 30; // Replace 10 with whatever limit you prefer
}

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
