// 📁 server/controllers/taskController.js (ESM)

import { poolPromise, sql } from '../config/db.js';

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    department,
    subject,
    projectId,
    location,
    priority,
    dueDate,
    endDate,
    recurrence,
    weeklyInterval, // ✅ new field
    reminder,
    notes,
    newTaskOption,
    assignedUsers = [],
    attachments = [],
  } = req.body;

  try {
    const pool = await poolPromise;

    // 1. Update the main task
    await pool.request()
      .input('ID', sql.Int, id)
      .input('Title', sql.NVarChar, title)
      .input('Department', sql.NVarChar, department)
      .input('Subject', sql.NVarChar, subject)
      .input('ProjectID', sql.NVarChar, projectId)
      .input('Location', sql.NVarChar, location)
      .input('Priority', sql.NVarChar, priority)
      .input('DueDate', sql.Date, dueDate)
      .input('EndDate', sql.Date, endDate)
      .input('Recurrence', sql.NVarChar, recurrence)
      .input('WeeklyInterval', sql.Int, weeklyInterval || null) // ✅ new line
      .input('Reminder', sql.NVarChar, reminder)
      .input('Notes', sql.NVarChar, notes)
      .input('NewTaskOption', sql.NVarChar, newTaskOption)
      .query(`
        UPDATE Tasks SET 
          Title = @Title,
          Department = @Department,
          Subject = @Subject,
          ProjectID = @ProjectID,
          Location = @Location,
          Priority = @Priority,
          DueDate = @DueDate,
          EndDate = @EndDate,
          Recurrence = @Recurrence,
          WeeklyInterval = @WeeklyInterval, -- ✅ new column
          Reminder = @Reminder,
          Notes = @Notes,
          NewTaskOption = @NewTaskOption
        WHERE ID = @ID
      `);

    // 2. Delete old task assignments and add new ones
    await pool.request().input('TaskID', sql.Int, id).query('DELETE FROM TaskAssignments WHERE TaskID = @TaskID');

    for (const userId of assignedUsers) {
      await pool.request()
        .input('TaskID', sql.Int, id)
        .input('UserID', sql.Int, userId)
        .query('INSERT INTO TaskAssignments (TaskID, UserID) VALUES (@TaskID, @UserID)');
    }

    // 3. Delete old attachments and add new ones
    await pool.request().input('TaskID', sql.Int, id).query('DELETE FROM Attachments WHERE TaskID = @TaskID');

    for (const att of attachments) {
      await pool.request()
        .input('TaskID', sql.Int, id)
        .input('Title', sql.NVarChar, att.title)
        .input('FileName', sql.NVarChar, att.file?.name || att.fileName || '')
        .query('INSERT INTO Attachments (TaskID, Title, FileName) VALUES (@TaskID, @Title, @FileName)');
    }

    res.status(200).json({ message: 'Task updated successfully' });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'Server error while updating task' });
  }
};

export const getTaskById = async (req, res) => {
  const { id } = req.params;
  try {
    
    const pool = await poolPromise;

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT * FROM Tasks WHERE ID = @id`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = result.recordset[0];

    // Optional: Fetch assigned users
    const assignedUsers = await pool.request()
      .input('TaskID', sql.Int, id)
      .query(`SELECT UserID FROM TaskAssignments WHERE TaskID = @TaskID`);

    task.assignedUsers = assignedUsers.recordset.map(row => row.UserID);

    // Optional: Fetch attachments
    const attachments = await pool.request()
      .input('TaskID', sql.Int, id)
      .query(`SELECT Title, FileName FROM Attachments WHERE TaskID = @TaskID`);

    task.attachments = attachments.recordset.map(row => ({
      title: row.Title,
      file: { name: row.FileName }
    }));

    res.status(200).json(task);

  } catch (err) {
    console.error('Error fetching task by ID:', err);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Tasks');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


export default { updateTask, getTaskById };