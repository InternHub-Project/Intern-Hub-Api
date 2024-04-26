def clean_skills_data(user_skills, jobs_skills):
    user_skills = ', '.join(user_skills).lower()

    jobs_skills = jobs_skills.apply(lambda x: ', '.join(x))
    jobs_skills = jobs_skills.fillna('').astype(str)
    jobs_skills = jobs_skills.str.lower()

    return user_skills, jobs_skills
