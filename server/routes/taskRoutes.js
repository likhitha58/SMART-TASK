import express from 'express';
import { poolPromise, sql } from '../config/db.js'; // make sure db.js exports correctly
import { updateTask, getTaskById, getAllTasks } from '../controllers/taskController.js';
import multer from 'multer';


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


router.post('/add-task', upload.array('attachments'), async (req, res) => {
  const {
    title, department, subject, projectId, location,
    priority, dueDate, endDate, recurrence, reminder,
    assignedUsers = [], notes, newTaskOption, weeklyDays
  } = req.body;

  const attachments = req.files || [];
  const attachmentTitles = req.body.attachmentTitles;
  const titlesArray = Array.isArray(attachmentTitles) ? attachmentTitles : [attachmentTitles];

  try {
    const pool = await poolPromise;
    const request = pool.request();

    // ✅ Format weeklyDays correctly
    let weeklyDaysString = '';
    if (weeklyDays) {
      try {
        const parsedWeeklyDays = JSON.parse(weeklyDays);
        weeklyDaysString = parsedWeeklyDays.join(','); // "Monday,Wednesday"
      } catch (err) {
        console.error('Invalid weeklyDays JSON:', weeklyDays);
        weeklyDaysString = '';
      }
    }

    // ✅ Insert Task
    request.input('Title', sql.NVarChar, title);
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
    request.input('WeeklyDays', sql.NVarChar, weeklyDaysString); // ✅ Correct casing & format

    const result = await request.query(`
      INSERT INTO Tasks (
        Title, Department, Subject, ProjectId, Location, Priority,
        DueDate, EndDate, Recurrence, Reminder, Notes, NewTaskOption, WeeklyDays
      )
      OUTPUT INSERTED.ID
      VALUES (
        @Title, @Department, @Subject, @ProjectId, @Location, @Priority,
        @DueDate, @EndDate, @Recurrence, @Reminder, @Notes, @NewTaskOption, @WeeklyDays
      );
    `);

    const taskId = result.recordset[0].ID;

    // ✅ Assigned Users
    for (const userId of Array.isArray(assignedUsers) ? assignedUsers : [assignedUsers]) {
      await pool.request()
        .input('TaskID', sql.Int, taskId)
        .input('UserID', sql.Int, userId)
        .query(`
          INSERT INTO TaskAssignments (TaskID, UserID)
          VALUES (@TaskID, @UserID);
        `);
    }

    // ✅ Attachments
    for (let i = 0; i < attachments.length; i++) {
      const file = attachments[i];
      const title = titlesArray[i] || file.originalname;
      await pool.request()
        .input('TaskID', sql.Int, taskId)
        .input('Title', sql.NVarChar, title)
        .input('FileName', sql.NVarChar, file.filename)
        .query(`
          INSERT INTO Attachments (TaskID, Title, FileName)
          VALUES (@TaskID, @Title, @FileName);
        `);
    }

    res.status(200).json({ message: 'Task added successfully', taskId });
  } catch (error) {
    console.error('❌ Error adding task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/attachment/:id', async (req, res) => {
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


export default router;
