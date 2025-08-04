#  Smart Task – MERN + SQL Server Project

**Smart Task** is a comprehensive **task and meeting management system** built using the **MERN stack** (React, Node.js, Express) but with **SQL Server** as the database (instead of MongoDB).  
It enables **secure task assignment, tracking, collaboration, file sharing, notes management**, and **Google Calendar & email integration** for better productivity.

---

##  Key Features

-  **JWT-based Admin Login** – Secure authentication and session handling
-  **Task Management** – Create, edit, and track tasks with recurrence options (daily / weekly / monthly)
-  **Multi-user Assignment** – Assign tasks to multiple employees
-  **Attachments & Notes** – Upload files and add notes to tasks
-  **Email Notifications** – Automated email alerts via Nodemailer
-  **Google Calendar Sync** – Schedule and track meetings/events directly
-  **Master Data Management** – Manage Departments, Project IDs, Locations
-  **Profile Photos** – Support for user profile pictures
-  **Role-Based Access** – 
  - Admin: Full CRUD on tasks & user management  
  - Assignees: Limited to adding notes/attachments  
  - Others: No access to unauthorized tasks

---

##  Tech Stack

### **Frontend**
-  React (with Vite for fast builds)
-  React-Bootstrap for UI components
- Axios for API calls

### **Backend**
-  Node.js + Express
-  SQL Server (using `mssql` Node.js package)
-  JWT authentication
-  Multer (file uploads)
-  Nodemailer
-  Google Calendar API Integration

---

##  Getting Started

### **1. Prerequisites**
- Node.js (v16+ recommended)
- SQL Server (local or hosted)
- SSMS (SQL Server Management Studio)

---

### **2. Clone the Repository**

```bash
git clone https://github.com/your-username/smart-task.git
cd smart-task
```
---

### **3. Backend setup**

```bash
cd server
npm install
```

- Create a .env file <br>
PORT=5000 <br>
JWT_SECRET=your_jwt_secret <br>
DB_USER=your_db_user <br>
DB_PASSWORD=your_db_password <br>
DB_SERVER=your_db_server  <br>
DB_NAME=SmartTaskDB <br>
EMAIL_USER=your_email@gmail.com <br>
EMAIL_PASS=your_email_app_password <br>
GOOGLE_CLIENT_ID=your_google_client_id <br>
GOOGLE_CLIENT_SECRET=your_google_client_secret <br>
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

Run the backend

```bash
npm run dev
```
---
### **4. Frontend setup**

```bash
cd ../client
npm install
npm run dev
```
The app will run at : http://localhost:5173

---
### **5. Folder Structure**

```bash
Smart-Task/
│
├── client/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   ├── utils/
│   └── assets/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── db/
│   └── .env
│
└── database/
    └── SmartTaskDB.sql

```

---
### **6. Authentication**
- JWT-based authentication
- Admin login required for dashboard and CRUD
- Tasks are private: <br>
        - Creator & assigned users can interact <br>
        - Others: Access denied

---
### **License**
This project is licensed under the MIT License.
