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
            enum: ['male', 'female']
        },
        address: AddressSchema,
        skillIDs:[{type:Schema.Types.ObjectId,ref:"Skill"}],
        cv:String,
        phone: [String],
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
        }
    },
    {
        timestamps: true
    }
);

userSchema.virtual("password").set(function(password){
    this.encryptedPassword=bcrypt.hashSync(password,parseInt(CONFIG.BCRYPT_SALT))
})
.get(function(){
    return this.encryptedPassword
})

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
