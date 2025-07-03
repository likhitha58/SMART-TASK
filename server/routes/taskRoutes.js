import express from 'express';
import { poolPromise, sql } from '../config/db.js'; // make sure db.js exports correctly
import { updateTask, getTaskById,  addTask, getUserTasks, getAllTasks } from '../controllers/taskController.js';
import multer from 'multer';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.get('/', authenticateUser, getUserTasks);

router.get('/:id', authenticateUser, getTaskById);
router.put('/:id', authenticateUser, upload.array('attachments'),updateTask);
router.post('/add-task', authenticateUser, upload.array('attachments'), addTask);
router.get('/tasks', authenticateUser, getAllTasks);

router.delete('/attachment/:id',authenticateUser, async (req, res) => {
  const attachmentId = req.params.id;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('ID', sql.Int, attachmentId)
      .query(`DELETE FROM Attachments WHERE ID = @ID`);

    res.status(200).json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// router.get('/:id', verifyToken, getTaskById);
// router.put('/:id', verifyToken, updateTask);
// router.post('/add-task', verifyToken, upload.array('attachments'), addTask);

export default router;
