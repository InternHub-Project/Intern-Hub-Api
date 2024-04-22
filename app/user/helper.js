


const getMissingSkills=(jobSkills,userSkills)=>{
    let matchScore = 0;
    const missingSkills = [];

    jobSkills.forEach(skill => {
        const lowerCaseJobSkills = skill.toLowerCase()
        if (userSkills.map(skill => skill.toLowerCase()).includes(lowerCaseJobSkills)) {
            matchScore++;
        } else {
            missingSkills.push(skill);
        }
    });
    const matchPercentage = (matchScore / jobSkills.length) * 100

    return {missingSkills,matchPercentage}
}







module.exports={
    getMissingSkills
}