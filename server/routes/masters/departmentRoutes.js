// 📁 backend/routes/masters/departmentRoutes.js
import express from 'express';
import { addDepartment, getDepartments, editDepartment, getDepartmentById } from '../../controllers/masters/departmentController.js';

const router = express.Router();

router.post('/add', addDepartment);
router.get('/', getDepartments);
router.put('/edit/:id', editDepartment);
router.get('/:id', getDepartmentById); 
export default router;
