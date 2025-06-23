import express from 'express';
import { poolPromise, sql } from '../config/db.js'; // make sure db.js exports correctly
import { updateTask, getTaskById , getAllTasks} from '../controllers/taskController.js';



const router = express.Router();

router.get('/', getAllTasks); 
router.get('/:id', getTaskById); 
router.put('/:id', updateTask);

router.get('/tasks', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Tasks');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/add-task', async (req, res) => {
  const {
    title, department, subject, projectId, location,
    priority, dueDate, endDate, recurrence, reminder,
    attachments = [], assignedUsers = [], notes, newTaskOption
  } = req.body;

  try {
    const pool = await poolPromise;
    const request = pool.request();

    // Insert Task
    request.input('Title', sql.NVarChar, title);
    // request.input('Description', sql.NVarChar, description);
    request.input('Department', sql.NVarChar, department);
    request.input('Subject', sql.NVarChar, subject);
    request.input('ProjectId', sql.NVarChar, projectId);
    request.input('Location', sql.NVarChar, location);
    request.input('Priority', sql.NVarChar, priority);
    request.input('DueDate', sql.Date, dueDate);
    request.input('EndDate', sql.Date, endDate);
    request.input('Recurrence', sql.NVarChar, recurrence);
    request.input('Reminder', sql.NVarChar, reminder);
    request.input('Notes', sql.NVarChar, notes);
    request.input('NewTaskOption', sql.NVarChar, newTaskOption);

    const result = await request.query(`
      INSERT INTO Tasks (Title, Department, Subject, ProjectId, Location, Priority, DueDate, EndDate, Recurrence, Reminder, Notes, NewTaskOption)
      OUTPUT INSERTED.ID
      VALUES (@Title, @Department, @Subject, @ProjectId, @Location, @Priority, @DueDate, @EndDate, @Recurrence, @Reminder, @Notes, @NewTaskOption);
    `);

    const taskId = result.recordset[0].ID;

    // Insert Assigned Users
    for (const userId of assignedUsers) {
      await pool.request()
        .input('TaskID', sql.Int, taskId)
        .input('UserID', sql.Int, userId)
        .query(`
          INSERT INTO TaskAssignments (TaskID, UserID)
          VALUES (@TaskID, @UserID);
        `);
    }

    // Insert Attachments
    for (const att of attachments) {
      await pool.request()
        .input('TaskID', sql.Int, taskId)
        .input('Title', sql.NVarChar, att.title)
        .input('FileName', sql.NVarChar, att.file?.name || att.fileName || '')
        .query(`
          INSERT INTO Attachments (TaskID, Title, FileName)
          VALUES (@TaskID, @Title, @FileName);
        `);
    }

    res.status(200).json({ message: 'Task added successfully', taskId });
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



export default router;
