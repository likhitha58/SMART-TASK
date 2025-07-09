import express from 'express';
import {
  getOwnCreatedTasks,
  getReviewData,
  saveReview,
  uploadReviewAttachments
} from '../controllers/reviewController.js';

import { verifyToken } from '../middleware/authMiddleware.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// ✅ Multer Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const uniqueName = `${Date.now()}-${baseName}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

/* -------------------------- 📌 ROUTES START -------------------------- */

// 🔹 1. Get all tasks created by current user
// GET /api/reviews/own-created-tasks
router.get('/own-created-tasks', verifyToken, getOwnCreatedTasks);

// 🔹 2. Get task + creator + attachments (for review screen)
// GET /api/reviews/:id/review-data
router.get('/:id/review-data', verifyToken, getReviewData);

// 🔹 3. Save review notes and status
// PUT /api/reviews/:taskId/review-status
router.put('/:taskId/review-status', verifyToken, saveReview);

// 🔹 4. Upload attachments for review
// POST /api/reviews/attachments/upload
router.post(
  '/attachments/upload',
  verifyToken,
  upload.array('attachments'),
  uploadReviewAttachments
);

/* -------------------------- 📌 ROUTES END -------------------------- */

export default router;
