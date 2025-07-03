import express from 'express';
import { addReview, getReviewsByTaskId, downloadReviewAttachment } from '../controllers/reviewController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Setup Multer for review attachment uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Add a review with attachments
router.post('/add', authenticateUser, upload.array('attachments'), addReview);

// Get all reviews for a task
router.get('/task/:taskId', authenticateUser, getReviewsByTaskId);

// Download review attachment
router.get('/attachment/:filename', authenticateUser, downloadReviewAttachment);

export default router;
