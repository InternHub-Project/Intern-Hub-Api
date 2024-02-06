const   mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
const {AddressSchema, SkillsSchema} = require('../../utils/utils.schema.js');
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
            required:true
        },
        firstName: String,
        lastName: String,
        birthdate: Date,
        gender:{
            type: String,
            enum: ['male', 'female',"other"]
        },
        address: AddressSchema,
        skills:SkillsSchema,
        cv:String,
        phone: [String],
        profileImage: String,
        experienceYears: Number,
        educationLevel: String,
        college: String,
        interests: String,
        gruduationDate: String,
        activateEmail: {
            type: Boolean,
            default: false,
        },
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