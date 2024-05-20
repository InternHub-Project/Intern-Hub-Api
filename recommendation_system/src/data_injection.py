from pymongo.mongo_client import MongoClient
import pandas as pd
import os
from config import MONGO_CONNECTION_STRING

def connect_to_db():
    uri = MONGO_CONNECTION_STRING
    client = MongoClient(uri)
    try:
        client.admin.command('ping')
        print("successfully connected to MongoDB!")
    except Exception as e:
        print(e)
        
    return client
def get_jobs_collection():
    directory = 'data'
    if not os.path.exists(directory):
        os.makedirs(directory)
    client = connect_to_db()
    db = client["db0"]
    pipeline = [
        {
            "$lookup": {
                "from": "companies",
                "localField": "companyId",
                "foreignField": "companyId",
                "as": "company_info"
            }
        },
        {
            "$unwind": "$company_info" 
        },
        {
            "$project": {
                "jobId": 1,
                "companyId": 1,
                "jobType": 1,
                "title": 1,
                "startDate": 1,
                "duration": 1,
                "durationType": 1,
                "Salary": 1,
                "salaryType": 1,
                "internType": 1,
                "internLocation": 1,
                "numberOfApplicants": 1,
                "numberOfOpenings": 1,
                "skills": 1,
                "statusOfIntern": 1,
                "description": 1,
                "questions": 1,
                "company_name": "$company_info.name" 
            }
        }
    ]

    jobs_collection = db["jobs"]
    jobs_with_company = list(jobs_collection.aggregate(pipeline))
    jobs_df = pd.DataFrame(jobs_with_company)
    jobs_df.to_pickle(os.path.join(directory, 'job_listings.pkl'))


