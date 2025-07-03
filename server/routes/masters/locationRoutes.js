// 📁 routes/masters/locationRoutes.js
import express from 'express';
import {
  getAllLocations,
  getLocationById,
  addLocation,
  updateLocation
} from '../../controllers/masters/locationController.js';

const router = express.Router();

router.get('/', getAllLocations);
router.get('/:id', getLocationById);
router.post('/add', addLocation);
router.put('/edit/:id', updateLocation);

export default router;
