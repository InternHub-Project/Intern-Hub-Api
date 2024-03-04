const mongoose = require("mongoose");

const jobSchema=new mongoose.Schema({
    jobId:String,
    companyId: {
        type: String,
        ref: 'Company', 
        required: true
    },
    jobType:{
        type:String,
        enum:["job","internShip"],
        default:"internShip"
    },
    title: String,
    startDate:String,
    duration:String,
    Salary:String,
    internType:{
        type:String,
        enum:["part-time","full-time"]
    },
    internLocation:String,
    numberOfApplicants:{
        type:Number,
        default:0
    },
    numberOfOpenings:Number,
    skills:[String],
    statusOfIntern:{
        type:String,
        enum:["draft","active","closed"],
        default:"draft"
    },
    description:String,
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps:true
})

jobSchema.virtual("company" /* any name you want */, {
    ref:"Company",            //->refer to Company model
    localField:"companyId",   //->specifies the field in the current schema that contains the value to match against the foreignField.
    foreignField:"companyId"  //->specifies the field in  (Company schema) that should match the value of the localField.
})


const jobModel=mongoose.model("Job",jobSchema);
module.exports=jobModel;