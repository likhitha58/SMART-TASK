// index.js (ESM version)

import express from 'express';
import cors from 'cors';
import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import employeeRoutes from './routes/employeeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ESM doesn't support __dirname, so we recreate it
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));

app.use(cors());
app.use(express.json());

// Route handlers
app.use('/api/employees', employeeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Optional base route
app.get('/', (req, res) => {
  res.send('Smart Task backend is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
