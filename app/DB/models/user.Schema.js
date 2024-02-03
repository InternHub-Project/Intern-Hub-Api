const   mongoose = require('mongoose');
const {AddressSchema} = require('../../utils/utils.schema')

const userSchema = new mongoose.Schema(
    {
        email: String,
        userId: String,
        fristName: String,
        lastName: String,
        password: String,
        birthdate: Date,
        gender:{
            type: String,
            enum: ['male', 'female']
        },
        address: AddressSchema,
        phone: [String],
        profileImage: String,
        //CV: File,
        skills:[
            {
                skillName:{
                    type: String,
                }
            }
        ],
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

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;