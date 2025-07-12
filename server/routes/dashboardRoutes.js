import express from 'express';
import { getOngoingTasks, getUpcomingTasks } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/ongoing-tasks', getOngoingTasks);
router.get('/upcoming-tasks', getUpcomingTasks);

export default router;
