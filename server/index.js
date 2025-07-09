// index.js (ESM version)

import express from 'express';
import cors from 'cors';
import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chatbotRoutes from './routes/chatbotRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import departmentRoutes from './routes/masters/departmentRoutes.js';
import locationRoutes from './routes/masters/locationRoutes.js';
import projectIdRoutes from './routes/masters/projectIdRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import taskHistoryRoutes from './routes/taskHistoryRoutes.js';
import { poolPromise } from './config/db.js';
dotenv.config();
const app = express();
app.use(express.json())
const PORT = process.env.PORT || 5000;

// ESM doesn't support __dirname, so we recreate it
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(cors());

// Route handlers
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/masters/departments', departmentRoutes);
app.use('/api/masters/locations', locationRoutes);
app.use('/api/masters/project-ids', projectIdRoutes);


app.use('/api/reviews', reviewRoutes);
// Optional base route
app.get('/', (req, res) => {
  res.send('Smart Task backend is running...');
});

app.use('/api/task-history', taskHistoryRoutes);

app.use('/api/chatbot', chatbotRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
