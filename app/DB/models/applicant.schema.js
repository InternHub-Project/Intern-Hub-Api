const mongoose = require("mongoose");

const applicantSchema=new mongoose.Schema({
    applicantId: String,
    userId: {
        type: String,
        ref: 'User', 
        required: true
    },
    jobId: {
        type: String,
        ref: 'Job', 
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    coverLetter: String,
    resume: String
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps:true
})

applicantSchema.virtual("user" /* any name you want */, {
    ref:"User",            //->refer to Company model
    localField:"userId",   //->specifies the field in the current schema that contains the value to match against the foreignField.
    foreignField:"userId"  //->specifies the field in  (Company schema) that should match the value of the localField.
})
applicantSchema.virtual("job" /* any name you want */, {
    ref:"Job",            //->refer to Company model
    localField:"jobId",   //->specifies the field in the current schema that contains the value to match against the foreignField.
    foreignField:"jobId"  //->specifies the field in  (Company schema) that should match the value of the localField.
})


const applicantModel=mongoose.model("Applicant",applicantSchema);
module.exports = applicantModel;