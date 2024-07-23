# InternHub

InternHub is a comprehensive job hunting platform designed to connect job seekers with potential employers. The platform leverages modern web technologies and AI to provide personalized job recommendations and streamline the job application process.

## Features

- User Authentication: Secure login and registration using JWT.
- Job Listings: Browse and search for job openings.
- Job Recommendations: AI-driven job recommendations tailored to user profiles.
- Application Tracking: Track the status of job applications.
- User Profiles: Create and update user profiles with resumes and cover letters.

## Tech Stack

### Backend

- **Node.js**
- **Express.js**
- **MongoDB**

### AI and Recommendations

- **Python**
- **Flask**

## Installation

### Prerequisites

- Node.js
- MongoDB
- Python 3.x
- pip

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/InternHub.git
   cd InternHub
   ```

2. **Backend Setup**

   - Navigate to the backend directory

     ```bash
     cd backend
     ```

   - Install Node.js dependencies

     ```bash
     npm install
     ```

   - Set up environment variables in a `.env` file

     ```
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     ```

   - Start the backend server

     ```bash
     npm start
     ```

3. **AI and Recommendations Setup**

   - Navigate to the AI directory

     ```bash
     cd ../recommendation_system
     ```

   - Install virtualenv

     ```bash
     pip install virtualenv --user
     ```

   - Set up a virtual environment

     ```bash
     python -m virtualenv venv
     ```

   - Activate the virtual environment

     ```bash
     venv/Scripts/activate  # On Unix-based systems use `source venv/bin/activate`
     ```

   - Install Python dependencies

     ```bash
     pip install -r requirements.txt --user
     ```

   - Set up environment variables in a `.env` file

     ```
     FLASK_APP=main.py
     FLASK_ENV=development
     ```

   - Start the Flask server

     ```bash
     python main.py
     ```

## Usage

1. **Access the Platform**

   Open your browser and go to `http://localhost:5000` for the main application.

2. **Explore Features**

   - Register or log in to your account.
   - Browse job listings and use the search functionality.
   - Check out personalized job recommendations.
   - Apply for jobs and track your applications.
   - Employers can post new job listings and manage existing ones.
