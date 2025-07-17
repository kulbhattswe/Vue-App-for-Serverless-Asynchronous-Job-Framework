# Vue App for Serverless Async Job Framework

This is a Vue 3 + Vuetify application that demonstrates the usage of the [Serverless Async Job Framework](https://github.com/kulbhattswe/serverless-async-job-framework). It provides a simple frontend interface for submitting long-running jobs, polling their status, and downloading results from S3 once complete.

## ✨ Features

- User authentication via AWS Cognito
- File or text input for submitting jobs
- Submits jobs to the async framework via REST API
- Polls job status and shows updates
- Provides a download link when job completes
- Displays all submitted jobs in a paginated table
- Secure access using JWT tokens
- Built with Vue 3, Vite, and Vuetify 3

## 🧱 Architecture

This app interacts with the backend serverless stack via the following endpoints:

- `POST /job`: Submit a new asynchronous job
- `GET /job?job_id=xyz`: Poll job status
- `GET /jobs`: Retrieve all jobs submitted by the user

The backend is implemented using the [serverless-async-job-framework](https://github.com/kulbhattswe/serverless-async-job-framework), which leverages AWS Lambda, DynamoDB, S3, API Gateway, and Step Functions.

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```
### 2. Install dependencies
```bash
npm install
```
### 3. Set environment variables
Create a .env.local file in the root and define:
```
VITE_API_URL=https://your-api-id.execute-api.region.amazonaws.com/prod
VITE_USER_POOL_ID=your_cognito_user_pool_id
VITE_CLIENT_ID=your_cognito_app_client_id
VITE_COGNITO_REGION=your_cognito_region
```

### 4. Run the app locally
```
npm run dev
```

### 5. Build for production
```bash
npm run build
```

## 🔒 Authentication
Authentication is handled using AWS Cognito User Pools. After login/signup, a JWT token is stored and attached to all API requests. The token is automatically refreshed using the refresh token to prevent session expiry.

## 📸 Screenshots
###
* [App screenshot](./images/appscreen.png)
* [Job submission with two content inputs](./images/jobsubmission.png)
* [Real-time job polling](./images/jobpolling.png)
* [Download link for S3 result](./images/downloadlink.png)
* [Paginated job history table](./images/jobhistory.png)

## 🧩 Tech Stack

* Vue 3
* Vuetify 3
* Vite
* Axios
* Amazon Cognito
* AWS Serverless Stack

## 📂 Related Projects
* 🔧 [Serverless Async Job Framework](https://github.com/kulbhattswe/serverless-async-job-framework) (GitHub)
