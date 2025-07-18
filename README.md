# 💼 Smart Task – MERN + SQL Server Project

**Smart Task** is a powerful task and meeting management system built with the **MERN stack** (using **SQL Server** instead of MongoDB) and a modern frontend using **React + Vite**. It enables secure task assignment, tracking, team collaboration, file uploads, and even Google Calendar & email integration.

---

## 🚀 Features

- 🔐 Admin login with JWT-based authentication
- 📋 Task creation with recurrence (daily/weekly/monthly)
- 👥 Assign tasks to multiple users
- 📎 Attach files and notes to tasks
- 📧 Email notifications using Nodemailer
- 📆 Google Calendar event sync
- 🧑‍💼 Master data management (Departments, Projects, Locations)
- 📸 User profile photo support

---

## 📦 Tech Stack

### 🖥 Frontend
- ⚛️ React (with Vite)
- 🎨 Bootstrap / React-Bootstrap
- ⚡ Vite (for lightning-fast dev builds)

### 🌐 Backend
- 🟢 Node.js + Express
- 🗄 SQL Server (`mssql` Node.js package)
- 🔐 JWT authentication
- 📂 Multer (for file uploads)
- 📧 Nodemailer
- 📅 Google Calendar API

---

## 🧑‍💻 Getting Started

### 🔧 Prerequisites

- Node.js (v16 or later)
- SQL Server (local or remote)
- SSMS (SQL Server Management Studio) for DB access

---

## ⚙️ Environment Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/smart-task.git
cd smart-task
```
### 2️⃣ Backend Setup
cd server
npm install

Create a .env file inside the server/ directory with the following content:<br>
PORT=5000<br>
JWT_SECRET=your_jwt_secret<br>
DB_USER=your_db_user<br>
DB_PASSWORD=your_db_password<br>
DB_SERVER=your_db_server  # e.g., localhost<br>
DB_NAME=SmartTaskDB<br>
EMAIL_USER=your_email@gmail.com<br>
EMAIL_PASS=your_email_app_password<br>
GOOGLE_CLIENT_ID=your_google_client_id<br>
GOOGLE_CLIENT_SECRET=your_google_client_secret<br>
GOOGLE_REFRESH_TOKEN=your_google_refresh_token<br>

Start backend server:<br>
npm run dev

### 3️⃣ Frontend Setup
cd ../client
npm install
npm run dev <br>

The app will run at:
📍 http://localhost:5173

###
📂 Folder Structure

Smart-Task/<br>
│
├── client/                      <br>
│   ├── components/              <br>
│   ├── pages/                   <br>
│   ├── styles/                  <br>
│   ├── utils/                   <br>
│   └── assets/                  <br><br>
│
├── server/                      <br>
│   ├── controllers/             <br>
│   ├── routes/                  <br>
│   ├── middleware/              <br>
│   ├── utils/                   <br>
│   ├── db/                      <br>
│   └── .env                     <br><br>
│
└── database/<br>
    └── SmartTaskDB.sql         <br>

---
###
🔐 Authentication
JWT-based token auth

Admin login required to access dashboard and perform CRUD

Tasks are private: only the creator and assigned users can view or interact

---
###
Frontend (client/)
npm run dev         # Run frontend dev server
npm run build       # Production build

Backend (server/)
npm run dev         # Run backend with nodemon

---
## 📝 License

This project is licensed under the **MIT License**.
