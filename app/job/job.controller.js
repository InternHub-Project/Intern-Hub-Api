const jobModel = require("../DB/models/job.schema.js");
const { paginationWrapper, sendResponse } = require("../utils/util.service.js");
const constans=require("../utils/constants.js");


const getAllJobs=async (req,res,next)=>{
    try {
        const skip = parseInt(req.query.skip, 10) || 0; 
        const size = parseInt(req.query.size, 10) || 10;
            const query={
                statusOfIntern:"active"
            }
        if(req.query.search){
            query.search=req.query.search
        }
        console.log(query.search);
        const filteredData  = await jobModel.find({$and:[{statusOfIntern:query.statusOfIntern},{$or:[
            { skills: { $regex: new RegExp(query.search, 'i') } },
            {title: { $regex: new RegExp(query.search, 'i') }},
            {description:{ $regex: new RegExp(query.search, 'i') }}
        ]}]}).populate([
            {
                path:"company",
                select:"name image"
            }
        ]).skip(skip).sort({createdAt:-1})
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