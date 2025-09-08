# Backend Test Submission – URL Shortener Microservice

This project implements a **URL Shortener Microservice** as per Affordmed Campus Hiring Backend Evaluation guidelines.  
It provides core URL shortening, expiry handling, analytics, and **remote logging integration** with the given Test Server APIs.

---

## **Features**
- **Short URL Creation** (Custom or Auto-generated Shortcode)
- **Expiry Handling** (Default: 30 mins, configurable)
- **Analytics** → Click counts, timestamps, IP, referrer
- **Redirect** → 302 redirect to original URL
- **Error Handling** → 400, 404, 409, 410 status codes
- **Logging Middleware**  
  - Local JSON logs (`/logs/access.log`)  
  - Remote Test Server Logging (`/register → /auth → /logs`) with Bearer token  

---

## **Tech Stack**
- **Node.js + Express.js** – Backend Framework
- **dotenv** – Config Management
- **fetch (built-in)** – Remote API calls
- **Custom Middleware** – Logging & Error Handling

---

## ⚙️ Setup Instructions

### **1. Clone & Install**
```bash
git clone https://github.com/<username>/2201641520097.git
cd 2201641520097/Backend\ Test\ Submission
npm install
```

### **2. Environment Variables**
```bash
Copy in .env:- 
PORT=3000
BASE_URL=http://localhost:3000

EMAIL=your_email@college.edu
NAME=Your Name
ROLLNO=2201641520097
GITHUB_USERNAME=yourgithub
ACCESS_CODE=<from email>

CLIENT_ID=
CLIENT_SECRET=
```

### **3. One-Time Registration**
```bash
node scripts/register.js
- Copy the clientID & clientSecret into .env
- Start server after updating .env
```

### **4. Start Server**
```bash
npm start
- Server URL: http://localhost:3000
```
