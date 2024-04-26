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
    jobs_collection = db["jobs"]
    jobs_df = pd.DataFrame(list(jobs_collection.find()))
    jobs_df.to_pickle('./data/job_listings.pkl')
    

