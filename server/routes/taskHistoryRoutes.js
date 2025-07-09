import express from 'express';
import { getAllTaskHistory, filterTaskHistory, getTaskHistoryById  } from '../controllers/taskHistoryController.js';
import {verifyToken} from '../middleware/authMiddleware.js'; // 🔐 If you're using JWT middleware

const router = express.Router();

// Routes
router.get('/', verifyToken, getAllTaskHistory);          // GET /api/task-history
router.get('/filter', verifyToken, filterTaskHistory);    // GET /api/task-history/filter
router.get('/view/:id', verifyToken, getTaskHistoryById);

export default router;
