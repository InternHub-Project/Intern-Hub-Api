from flask import Flask, request

from src.job_recommendations import *
from src.data_injection import *

app = Flask(__name__)

@app.route('/get_recommendations', methods=['Post'])
def recommendations():
    user_skills = request.get_json()
    user_skills_list = user_skills['skills']
    jobs_df = get_recommendations(user_skills_list)
    jobs_json = jobs_df.to_json(orient='records' , default_handler=str) 

    return jobs_json


@app.route('/update_jobs_data', methods=['Get'])
def update_data():
    get_jobs_collection()
    return "done"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

