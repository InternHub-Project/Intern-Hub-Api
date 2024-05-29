import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from src.data_processing import *


def get_recommendations(user_skills):
    df = pd.read_pickle('./data/job_listings.pkl')
    user_skills, df['skills'] = clean_skills_data(user_skills, df['skills'])
    skills_vectorizer = TfidfVectorizer(tokenizer=lambda x: x.split(', '))
    skills_matrix = skills_vectorizer.fit_transform(df['skills'])
    user_skills_matrix = skills_vectorizer.transform([user_skills])

    cosine_sim = cosine_similarity(user_skills_matrix, skills_matrix)
    similarity_percentage = (cosine_sim.flatten() * 100).round(2)

    df['similarity_score'] = similarity_percentage
    df = df.sort_values(by='similarity_score', ascending=False)

    N = 5
    recommended_jobs = df.head(N)

    return recommended_jobs
