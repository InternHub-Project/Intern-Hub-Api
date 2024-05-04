



function addCompanyNameAndImageToResponse(filteredData) {
    return filteredData.map(document => {
        const job = document.toObject();
        job.companyName = job.company[0]?.name;
        job.companyImage = job.company[0]?.image;
        delete job.company;
        return job;
    });
}





function prepareQuery(title, type, location, duration, salary, salaryType, jobType, skills,durationType) {
    const query={
        statusOfIntern: "active",
        ...(title && {title}),
        ...(type && {internType: type}),
        ...(location && {internLocation: location}),
        ...(duration && {duration}),
        ...(salary && {Salary: salary}),
        ...(salaryType && {salaryType}),
        ...(durationType && {durationType}),
        ...(jobType && {jobType}),
        ...(skills && {skills: {$in: skills.split(',')}})
    };
    if(title){
        query.title = { $regex: new RegExp(title, 'i') };
    }
    if(skills){
        query.skills={$regex:new RegExp(skills,"i")}
    }
    if(location){
        query.internLocation={$regex:new RegExp(location,"i")}
    }
    if(type){
        query.internType={$regex:new RegExp(type,"i")}
    }
    if(jobType){
        query.jobType={$regex:new RegExp(jobType,"i")}
    }
    if(durationType){
        query.durationType={$regex:new RegExp(durationType,"i")}
    }
    return query
}


module.exports={
    addCompanyNameAndImageToResponse,
    prepareQuery
}