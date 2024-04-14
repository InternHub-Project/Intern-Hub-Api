const jobModel = require("../DB/models/job.schema.js");
const {paginationWrapper, sendResponse} = require("../utils/util.service.js");
const constans = require("../utils/constants.js");
const userModel = require("../DB/models/user.Schema.js");
const applicantModel = require("../DB/models/applicant.schema.js");

const getAllJobs = async (req, res) => {
    async function getFilteredData(regex, offset, limit) {
        return jobModel.find({
            $or: [
                {skills: {$regex: regex}},
                {title: {$regex: regex}},
                {description: {$regex: regex}}
            ]
        }).populate('company', 'name image')
            .skip(offset || req.query.skip)
            .limit(limit)
            .sort({createdAt: -1});
    }

    function addCompanyNameAndImageToResponse(filteredData) {
        return filteredData.map(document => {
            const job = document.toObject();
            job.companyName = job.company[0]?.name;
            job.companyImage = job.company[0]?.image;
            delete job.company;
            return job;
        });
    }

    try {
        const {limit, offset} = paginationWrapper(req.query.page, req.query.size)
        const search = req.query.search || '';
        const regex = new RegExp(search, 'i');

        const filteredData = await getFilteredData(regex, offset, limit);
        const updatedFilteredData = addCompanyNameAndImageToResponse(filteredData);

        if (updatedFilteredData.length) {
            return sendResponse(res, constans.RESPONSE_SUCCESS, "Done", updatedFilteredData, []);
        }

        sendResponse(res, constans.RESPONSE_NOT_FOUND, "No Jobs Found", [], []);
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, [], []);
    }
}

const filterJobs = async (req, res) => {
    async function getFilteredData(query, offset, limit) {
        return jobModel.find(query).populate("company", "name image")
            .skip(offset || req.query.skip)
            .limit(limit)
            .sort({createdAt: -1});
    }

    function addCompanyNameAndImageToResponse(filteredData) {
        return filteredData.map(document => {
            const job = document.toObject();
            job.companyName = job.company[0]?.name;
            job.companyImage = job.company[0]?.image;
            delete job.company;
            return job;
        });
    }

    function prepareQuery(title, type, location, duration, salary, salaryType, jobType, skills) {
        return {
            statusOfIntern: "active",
            ...(title && {title}),
            ...(type && {internType: type}),
            ...(location && {internLocation: location}),
            ...(duration && {duration}),
            ...(salary && {Salary: salary.toString()}),
            ...(salaryType && {salaryType}),
            ...(jobType && {jobType}),
            ...(skills && {skills: {$in: skills.split(',')}})
        };
    }

    try {
        const {limit, offset} = paginationWrapper(req.query.page, req.query.size);
        const {title, salary, type, location, duration, salaryType, jobType, skills} = req.query;

        const query = prepareQuery(title, type, location, duration, salary, salaryType, jobType, skills);

        const filteredData = await getFilteredData(query, offset, limit);

        const updatedFilteredData = addCompanyNameAndImageToResponse(filteredData);

        const message = updatedFilteredData.length ? "Done" : "No Job found";
        sendResponse(res, constans.RESPONSE_SUCCESS, message, updatedFilteredData, []);
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '', []);
    }
}

const recommendedJobs = async (req, res) => {
    try {
        const {userId} = req.user;
        const {skip, size} = req.query

        const user = await userModel.findOne({userId});
        if (!user) {
            return sendResponse(res, constans.RESPONSE_BAD_REQUEST, "User not found", [], []);
        }

        const {skills: userSkills} = user;
        const jobsData = await jobModel.find({skills: {$in: userSkills}}).skip(skip).limit(size).sort({createdAt: -1});

        if (jobsData.length) {
            return sendResponse(res, constans.RESPONSE_SUCCESS, "Done", jobsData, []);
        }

        sendResponse(res, constans.RESPONSE_NOT_FOUND, "No Jobs Found", [], []);
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, [], []);
    }
};

const Applications = async (req, res) => {
    try {
        const {userId} = req.user;
        const {limit, offset} = paginationWrapper(
            req.query.page,
            req.query.size
        )
        const checkUser = await userModel.findOne({userId})
        if (!checkUser) {
            return sendResponse(res, constans.RESPONSE_BAD_REQUEST, "User not found", "", []);
        } else {
            const applications = await applicantModel.find({userId: userId}).skip(offset || req.body.skip).limit(limit).sort({createdAt: -1}).populate([
                {
                    path: "user",
                    select: "email userName skills phone userName"
                },
                {
                    path: "job", populate: {
                        path: "company",
                        select: "name"
                    }
                }
            ])
            if (!applications) {
                return sendResponse(res, constans.RESPONSE_SUCCESS, "No application Found ,applay to Jobs", "", [])
            } else {
                const transformedApplications = applications.map(app => {
                    // Destructure the application document to extract fields you want to omit or modify
                    const {__v, ...rest} = app.toObject({getters: true});
                    const userObject = app.user[0];
                    const jobObject = app.job[0];
                    const companyObject = app.job[0].company[0]
                    // Construct a new object with the fields you want to keep or add
                    return {
                        //.....applicants.....//
                        applicantId: res.applicantId,
                        numberOfApplicants: jobObject.numberOfApplicants,
                        createdAt: rest.createdAt,
                        //.....user......//
                        userId: rest.userId,
                        email: userObject.email,
                        phone: userObject.phone,
                        userName: userObject.userName,
                        resume: rest.resume,
                        coverLetter: rest.coverLetter,
                        userSkills: userObject.skills,
                        status: rest.status,
                        points: rest.points,
                        missingSkills: rest.missingSkills,
                        //.....Job.....//
                        jobId: rest.jobId,
                        jobtitle: jobObject.title,
                        //......company.....//
                        companyId: companyObject.companyId,
                        companyName: companyObject.name,
                    };
                });
                sendResponse(res, constans.RESPONSE_SUCCESS, "Done", transformedApplications, []);
            }
        }
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '', []);
    }
}

const jobDetails = async (req, res) => {
    try {
        const {jobId} = req.params
        if (!jobId) {
            return sendResponse(res, constans.RESPONSE_BAD_REQUEST, "Invalid Job ID", "", [])
        } else {
            const jobdetails = await jobModel.findOne({jobId})
            if (!jobdetails) {
                sendResponse(res, constans.RESPONSE_BAD_REQUEST, "Job is Not found", "", [])
            } else {
                sendResponse(res, constans.RESPONSE_SUCCESS, "Done", jobdetails, []);
            }
        }
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '', []);
    }
}

const jobApplicants = async (req, res) => {
    try {
        const {companyId} = req.user;
        const {jobId} = req.params;
        if (!jobId) {
            return sendResponse(res, constans.RESPONSE_BAD_REQUEST, "Invalid Job ID", "", [])
        }
        const job = await jobModel.findOne({jobId, companyId}).populate([
            {
                path: "applicants"
            }
        ])
        if (!job) {
            sendResponse(res, constans.RESPONSE_UNAUTHORIZED, "job Not found Or Something error ", '', []);
        } else {
            sendResponse(res, constans.RESPONSE_SUCCESS, "Done", job, []);
        }
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '', []);
    }
}


module.exports = {
    getAllJobs,
    recommendedJobs,
    Applications,
    jobDetails,
    getJobs: filterJobs,
    jobApplicants
}