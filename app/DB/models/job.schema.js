const mongoose = require("mongoose");

const jobSchema=new mongoose.Schema({
    jobId:String,
    companyId:{
        type:String,
        required:true
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
    numberOfApplicants:Number,
    numberOfOpenings:Number,
    skills:[String],
    statusOfIntern:{
        type:String,
        enum:["draft","active","closed"],
        default:"draft"
    },
    description:String,
},{
    timestamps:true
})

const jobModel=mongoose.model("Job",jobSchema);
module.exports=jobModel;