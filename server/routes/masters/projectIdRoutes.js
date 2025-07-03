// 📁 server/routes/masters/projectIdRoutes.js

import express from 'express';
import {
  getAllProjectIds,
  getProjectIdById,
  addProjectId,
  updateProjectId
} from '../../controllers/masters/projectIdController.js';

import multer from 'multer';

// Configure multer to store uploaded files in the 'uploads/' folder
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Base route: /api/masters/project-ids (defined in app.js or server.js)

router.get('/', getAllProjectIds);                // GET all project IDs
router.get('/:id', getProjectIdById);             // GET a specific project by ID
router.post('/add', upload.single('ProjectIdFile'), addProjectId); // POST with file upload
router.put('/edit/:id', upload.single('ProjectIdFile'), updateProjectId); // PUT with file upload support

export default router;
