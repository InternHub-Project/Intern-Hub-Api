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
        ]).skip(skip).limit(size).sort({createdAt:-1})
        const updatedFilteredData = filteredData.map(document => {
            const job = document.toObject();
            job.companyName = job.company[0]?.name; 
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

const recommendedJobs = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const {init,limit}=req.query
        const user = await userModel.findOne({ userId });
        if (!user) {
            return sendResponse(res,constans.RESPONSE_BAD_REQUEST,"User not found", "", []);
        }
        const { skills } = user;
        const jobs = await fetchJobsBasedOnSkills(skills);
        if (jobs.length === 0) {
            return sendResponse(res,constans.RESPONSE_SUCCESS,"No recommended jobs for you.", "", []);
        }
        else{
        jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const numberOfJobsToSend = limit||10
        const initNumber=init||0
        const limitedJobs = jobs.slice(initNumber, numberOfJobsToSend);
        return sendResponse(res,constans.RESPONSE_SUCCESS,"recommended jobs",limitedJobs,[]);
        }
      
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '',[]);
    }
};


async function fetchJobsBasedOnSkills(skills) {
    const allJobs = await jobModel.find();
    return allJobs.filter(job =>
        job.skills.some(skill => skills.includes(skill))
    );
}

const getJops = async (req, res, next) => {
    try{
        const{limit,offset}=paginationWrapper(
            page = req.query.page,
            size = req.query.size
        )
        const query={
            statusOfIntern:"active"
        }
        const { title, salary, type, location, duration, salaryType, jobType, skills } = req.query;
        if(title){
            query.title = title;
        }
        if(type){
            query.internType = type
        }
        if(location){
            query.internLocation = location
        }
        if(duration) {
            query.duration = duration
        }
        if(salary){
            query.Salary = salary.toString()
        }
        if(salaryType){
            query.salaryType = salaryType;
        }
        if(jobType){
            query.jobType = jobType;
        }
        if(skills){
            const skill = [];
            skill.push(...skills.split(','));
            console.log(skill);
            query.skills = { $in: skill };
        }
        const filteredData  = await jobModel.find(query).populate([
            {
                path:"company",
                select:"name image"
            }
        ]).skip(offset||req.query.skip).limit(limit).sort({createdAt: -1})
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
    }catch{
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '',[]);
    }
}




module.exports={
    getAllJobs,
    recommendedJobs,
    getJops
}