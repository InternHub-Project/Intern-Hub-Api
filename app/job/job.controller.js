const jobModel = require("../DB/models/job.schema.js");
const { paginationWrapper, sendResponse } = require("../utils/util.service.js");
const constans=require("../utils/constants.js");


const getAllJobs=async (req,res,next)=>{
    try {
        const{limit,offset}=paginationWrapper(
            page=req.query.page,
            size=req.query.size
          )
            const query={
                statusOfIntern:"active"
            }
        const {title,salary,type,location,duration} =req.query;
        if(title){
            query.title = title;
        }
        if(type){
            query.internType=type
        }
        if(location){
            query.internLocation=location
        }
        if(duration) {
            query.duration=duration
        }
        if(salary){
            query.Salary=salary.toString()
        }
        const filteredData  = await jobModel.find(query).populate([
            {
                path:"company",
                select:"name image"
            }
        ]).skip(offset).limit(limit)
        const updatedFilteredData = filteredData.map(document => {
            // Convert the Mongoose document to a plain JavaScript object
            const job = document.toObject();
            // Add companyName field from the company array (assuming the first company is the correct one)
            job.companyName = job.company[0]?.name; // Use optional chaining in case company array is empty
            job.companyImage=job.company[0]?.image
            // Remove the company field
            delete job.company;
            return job;
        });
        updatedFilteredData.length?sendResponse(res,constans.RESPONSE_SUCCESS,"Done",updatedFilteredData ,[]):sendResponse(res,constans.RESPONSE_SUCCESS,"No Job found",{} ,[])
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '',[]);
    }
   
}




module.exports={
    getAllJobs
}